import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { JWT } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';
import { getFirebaseConfig } from './firebase.config';
import { initializeFirebase } from './firebase.init';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  public db: admin.firestore.Firestore;
  public auth: admin.auth.Auth;
  public client: JWT;

  private readonly SCOPES = [
    'https://www.googleapis.com/auth/firebase.messaging',
    'https://www.googleapis.com/auth/places',
  ];

  constructor(private readonly configService: ConfigService) {
    // Initialize Firebase Admin SDK
    try {
      initializeFirebase();
      
      // Get Firebase configuration
      const { projectId, clientEmail, privateKey } = getFirebaseConfig(this.configService);
      
      // Initialize JWT client for Google Auth
      this.client = new JWT({
        email: clientEmail,
        key: privateKey,
        scopes: this.SCOPES,
      });

      this.db = admin.firestore();
      this.auth = admin.auth();
      
      this.logger.log('FirebaseService initialized with Firebase Admin SDK');
    } catch (error) {
      this.logger.error('Error initializing FirebaseService:', error);
      throw error;
    }
  }

  onModuleInit() {
    this.logger.log('FirebaseService initialized');
  }

  // Helper method to verify a user's authentication
  async verifyFirebaseAuth(uid: string): Promise<boolean> {
    try {
      this.logger.log(`Verifying Firebase auth for uid: ${uid}`);
      const userRef = this.db.collection('users').doc(uid);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        this.logger.log('User document does not exist');
        throw new Error('User not found');
      }

      this.logger.log('User document exists');
      return true;
    } catch (error) {
      this.logger.error('Firebase auth error:', {
        message: error?.message || 'Unknown error',
        code: error?.code || 'No error code',
      });
      throw error;
    }
  }
} 