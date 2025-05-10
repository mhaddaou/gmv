import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly stripe: Stripe;

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly configService: ConfigService,
  ) {
    const stripeSecretKey = this.configService.get<string>('stripe.secretKey');
    
    if (!stripeSecretKey) {
      this.logger.error('Missing Stripe secret key. Payments will not work!');
      // Create a dummy Stripe instance with a placeholder key to prevent crashes
      // In production, you would want to throw an error here
      this.stripe = new Stripe('sk_test_placeholder', {
        apiVersion: '2025-04-30.basil', 
      });
    } else {
      this.logger.log('Stripe initialized successfully');
      this.stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2025-04-30.basil', // Using the latest stable API version
      });
    }
  }

  async createSubscriptionLink(email: string, uid: string, queriesCount: number = 1943) {
    try {
      if (!email || !uid) {
        throw new Error('Email and UID are required');
      }

      // Step 1: Create the Product
      const product = await this.stripe.products.create({
        name: 'Lifetime Access',
        description:
          'Unlock the power of efficient local search with GMB Builder. Our tool empowers you to effortlessly find and explore a diverse range of places tailored to your needs. With our Lifetime Access plan, you get unlimited access to all features. Each purchase includes metadata to monitor your queries count, helping you optimize your searches and make informed business decisions.',
        metadata: {
          queriesCount: `${queriesCount}`, // Ensure metadata is a string
        },
      });
      this.logger.log(`Product created: ${product.id}`);

      // Step 2: Create the Price (one-time payment)
      const price = await this.stripe.prices.create({
        unit_amount: 49900, // 499 USD in cents
        currency: 'usd',
        product: product.id,
      });
      this.logger.log(`Price created: ${price.id}`);

      // Step 3: Create a Checkout Session
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: price.id,
            quantity: 1,
          },
        ],
        mode: 'payment',
        customer_email: email.toString().replace(' ', '+'),
        success_url: `https://gmb-builder.com/payment-success?uid=${uid}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: 'https://gmb-builder.com/auth/login',
      });
      this.logger.log(`Checkout session created: ${session.id}`);

      // Step 4: Return the Checkout URL
      return {
        url: session.url,
        product,
      };
    } catch (error) {
      this.logger.error(`Error creating payment link: ${error.message}`, error.stack);
      throw error;
    }
  }

  async storePayment(sessionId: string, uid: string) {
    try {
      if (!sessionId || !uid) {
        throw new Error('Missing sessionId or uid.');
      }

      // Retrieve user with the given uid
      const userDoc = await this.firebaseService.db.collection('users').doc(uid).get();

      if (!userDoc.exists) {
        throw new Error('User not found.');
      }

      // Check if payment with this sessionId already exists
      const paymentQuerySnapshot = await this.firebaseService.db
        .collection('payments')
        .where('sessionId', '==', sessionId)
        .get();

      if (!paymentQuerySnapshot.empty) {
        throw new Error('Payment already exists.');
      }

      // Retrieve the Stripe session
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);

      if (!session || session.payment_status !== 'paid') {
        throw new Error('Invalid session or payment not completed.');
      }

      // Add payment record to the 'payments' collection
      await this.firebaseService.db.collection('payments').add({
        sessionId,
        paymentId: session.payment_intent,
        queriesCount: 1943,
        queriesConsumed: 0,
        uid,
        paymentType: 'lifetime', // Indicate this is a lifetime access payment
        amount: session.amount_total, // Store the payment amount
        currency: session.currency,
        timestamp: new Date(),
        status: 'active', // Payment is active and valid
      });

      return { message: 'Payment record stored successfully.' };
    } catch (error) {
      this.logger.error(`Error storing payment: ${error.message}`, error.stack);
      throw error;
    }
  }

  async checkPayment(uid: string) {
    try {
      if (!uid) {
        throw new Error('Missing uid.');
      }

      // Retrieve the payment document with the given uid from Firestore
      const paymentSnapshot = await this.firebaseService.db
        .collection('payments')
        .where('uid', '==', uid)
        .get();

      if (paymentSnapshot.empty) {
        throw new Error('Payment record not found for this user.');
      }

      // Assuming each user has only one payment document
      const paymentDoc = paymentSnapshot.docs[0];
      const paymentData = paymentDoc.data();

      // Check if payment exists and has queriesCount
      if (!paymentData || !paymentData.queriesCount) {
        throw new Error('Invalid payment record.');
      }

      // Return lifetime access details
      return {
        paymentId: paymentData.paymentId,
        price: paymentData.amount,
        currency: paymentData.currency,
        status: 'active', // Lifetime access is always active
        type: 'lifetime',
        queriesCount: paymentData.queriesCount,
        queriesConsumed: paymentData.queriesConsumed || 0,
        queriesRemaining:
          paymentData.queriesCount - (paymentData.queriesConsumed || 0),
        purchaseDate: paymentData.timestamp
          ? new Date(paymentData.timestamp._seconds * 1000).toISOString()
          : null,
      };
    } catch (error) {
      this.logger.error(`Error checking payment status: ${error.message}`, error.stack);
      throw error;
    }
  }

  async checkLogCounts(uid: string) {
    try {
      if (!uid) {
        throw new Error('Missing uid.');
      }
      // Retrieve the payment document with the given uid from Firestore
      const paymentSnapshot = await this.firebaseService.db
        .collection('payments')
        .where('uid', '==', uid)
        .get();

      if (paymentSnapshot.empty) {
        throw new Error('Payment record not found for this user.');
      }

      const startDate = new Date(0); // Start from Unix epoch
      const endDate = new Date(); // Current time

      // Retrieve the log documents with the given uid from Firestore
      const logSnapshot = await this.firebaseService.db
        .collection('logs')
        .where('userId', '==', uid)
        .where('timestamp', '>=', startDate)
        .where('timestamp', '<=', endDate)
        .get();

      if (logSnapshot.empty) {
        return { lengthDocs: 0 };
      }

      // Get the total length of documents
      const lengthDocs = logSnapshot.docs.length;

      // Respond with the retrieved information
      return { lengthDocs };
    } catch (error) {
      this.logger.error(`Error checking log counts: ${error.message}`, error.stack);
      throw error;
    }
  }
} 