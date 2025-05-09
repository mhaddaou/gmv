import axios from "axios";
import express from "express";
import { JSDOM } from "jsdom";
import { ParsedQs } from "qs"; // If you're using the 'qs' package
import serviceAccount from "./firebase.json";
import { JWT } from 'google-auth-library';

const Stripe = require("stripe");
const cors = require("cors");
const firebase = require("firebase-admin");
const nodemailer = require("nodemailer");
const stripe = Stripe("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"); // Replace with your Stripe secret key
/* const stripe = Stripe(
  "sk_test_51Q9qC2CXXnzEzv7A37tqe65DF4U6H78JD9raYdkc3HBoDMmEbULUO8litXue1WF8meMrvCEfvM2mPtIhUo4MKCJr004Th7OUAb"
); */
const app = express();
app.use(express.json());

//New Migration of Oauth 2.0
const SCOPES = [
  'https://www.googleapis.com/auth/firebase.messaging',
  'https://www.googleapis.com/auth/places'
];

const client = new JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: SCOPES
});

async function getAccessToken() {
    try {
        console.log('Attempting to get access token...');
        console.log('Service Account Email:', serviceAccount.client_email);
        console.log('Scopes:', SCOPES);
        
        const tokens = await client.authorize();
        console.log('Token obtained successfully');
        console.log('Token type:', tokens.token_type);
        console.log('Token expires in:', tokens.expiry_date);
        
        if (!tokens.access_token) {
            throw new Error('No access token in response');
        }
        
        return tokens.access_token;
    } catch (error: any) {
        console.error('Detailed error in getAccessToken:', {
            message: error?.message || 'Unknown error',
            code: error?.code || 'No error code',
            stack: error?.stack || 'No stack trace'
        });
        throw error;
    }
}

// Initialize Firebase with the service account
firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
});

// Get Firestore instance
const db = firebase.firestore();

// Create a CORS middleware with specific options
const corsOptions = {
  origin: ['https://gmb-builder.com', 'https://gmb.adelphalabs.com',"http://localhost:3000"], // Proper domain format
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Enable CORS for all routes with the specified options
app.use(cors(corsOptions));

// Add OPTIONS handling for preflight requests
app.options('*', cors(corsOptions));

// const urlApiNearby = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
const urlApiPlaces =
  "https://maps.googleapis.com/maps/api/place/textsearch/json";
const urlApiDetails = "https://maps.googleapis.com/maps/api/place/details/json";
const apiKey = "AIzaSyDpLPZFmUhsITjymZQlby8OHP0HHu0JsJ0";

interface ClassApi {
  pageToken: string;
  latitude: string;
  longitude: string;
  type: string;
  radius: string;
  country: string;
  city: string;
  state: string;
  search: string;
  uid: string;
}

// Utility function to safely cast to string
const toString = (
  value: string | ParsedQs | string[] | ParsedQs[] | undefined
): string => {
  if (typeof value === "string") {
    return value;
  }
  return ""; // Default to an empty string if value is not a valid string
};

function getAddressSeparated(htmlString: string) {
  // Parse the HTML string using JSDOM
  const dom = new JSDOM(htmlString);
  const doc = dom.window.document;

  // Extract each value by class name
  const streetAddress = doc.querySelector(".street-address")?.textContent || "";
  const locality = doc.querySelector(".locality")?.textContent || "";
  const region = doc.querySelector(".region")?.textContent || "";
  const postalCode = doc.querySelector(".postal-code")?.textContent || "";
  const country = doc.querySelector(".country-name")?.textContent || "";

  return {
    streetAddress,
    city: locality,
    state: region,
    zipCode: postalCode,
    country,
  };
}

// Add error handling for Firebase operations
async function verifyFirebaseAuth(uid: string) {
    try {
        console.log('Verifying Firebase auth for uid:', uid);
        const userRef = db.collection("users").doc(uid);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
            console.log('User document does not exist');
            throw new Error('User not found');
        }
        
        console.log('User document exists');
        return true;
    } catch (error: any) {
        console.error('Firebase auth error:', {
            message: error?.message || 'Unknown error',
            code: error?.code || 'No error code'
        });
        throw error;
    }
}

async function getPlacesApi({
  pageToken,
  latitude,
  longitude,
  type,
  radius,
  search,
  country,
  city,
  state,
  uid,
}: ClassApi) {
  try {
    // Verify Firebase auth first
    await verifyFirebaseAuth(uid);
    
    // Get access token for authentication
    console.log('Getting access token for Places API...');
    const accessToken = await getAccessToken();
    console.log('Access token obtained:', accessToken ? 'Yes' : 'No');
    
    if (!accessToken) {
      throw new Error('Failed to obtain access token');
    }

    // Retrieve the payment document with the given uid from Firestore
    console.log('Checking payment status for uid:', uid);
    const paymentSnapshot = await db
      .collection("payments")
      .where("uid", "==", uid)
      .get();

    if (paymentSnapshot.empty) {
      console.log('No payment found for user');
      return {
        message: "You need to purchase lifetime access before searching for places!",
      };
    }

    // Assuming each user has only one payment document
    const paymentDoc = paymentSnapshot.docs[0];
    const paymentData = paymentDoc.data();

    // Check if payment exists and has queriesCount
    if (!paymentData || !paymentData.queriesCount) {
      return {
        message: "Invalid payment record.",
      };
    }

    const { queriesCount } = paymentData;

    // For lifetime access, we'll check all-time usage rather than period-based
    const startDate = new Date(0); // Start from Unix epoch
    const endDate = new Date(); // Current time

    const logSnapshot = await db
      .collection("logs") // Query the 'logs' collection
      .where("userId", "==", uid) // Find all logs related to this user// Match the user ID
      .where("timestamp", ">=", startDate) // Logs from September 1, 2024
      .where("timestamp", "<=", endDate)
      .get();
    // Assuming you're only interested in the first log (or change this logic as needed)
    const lengthDocs = logSnapshot.docs.length; // If there are multiple logs, you might need to handle this differently
    if (lengthDocs >= queriesCount) {
      // you have reached the limit
      return {
        message: "Out of queries",
      };
    }
    // Proceed with the API call
    let url = urlApiPlaces;
    if (pageToken) {
      url += "?pagetoken=" + pageToken;
    } else {
      url += "?location=" + latitude + "," + longitude;
      url += "&radius=" + (radius ? radius : 1500);
      url += "&query=";
      if (country) url += country + ",";
      if (city) url += city + ",";
      if (state) url += state + ",";
      if (search) url += search + ",";
      if (type) url += type + ",";
    }
    url += "&key=" + apiKey;
    
    console.log('Making Places API request to:', url);
    console.log('Request headers:', {
      'Authorization': `Bearer ${accessToken.substring(0, 10)}...`,
      'Accept': 'application/json'
    });

    const response: any = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    console.log('Places API response status:', response.status);
    console.log('Places API response headers:', response.headers);

    if (!response.data || !response.data.results) {
      throw new Error('Invalid response from Places API');
    }

    const dataList = response.data.results;
    console.log("dataList", dataList);
    let result: any = [];

    if (dataList && dataList.length > 0) {
      // Use `map` instead of `forEach` to return an array of promises
      result = await Promise.all(
        dataList.map(async (s: any) => {
          const details = await getDetailsAPi({
            placeId: s?.place_id,
          });
          const addressObject = getAddressSeparated(
            details?.data?.result?.adr_address
          );
          return {
            name: s?.name,
            domain: "",
            phone: details?.data?.result?.formatted_phone_number,
            website: details?.data?.result?.website,
            address: {
              address1: addressObject?.streetAddress,
              address2: "",
              city: addressObject?.city,
              state: addressObject?.state,
              country: addressObject?.country,
              zipCode: addressObject?.zipCode,
            },
            numberOfEmployees: "",
            revenue: "",
            facebook: "",
            linkedin: "",
            site: details?.data?.result?.website,
            googleMapsUrl: details?.data?.result?.url,
            ...s,
          };
        })
      );
    }

    // Log the userId and the count of the list to the Firestore 'logs' collection
    const logEntry = {
      userId: uid,
      count: result.length,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    };

    await firebase.firestore().collection("logs").add(logEntry);
    console.log("Log added with userId and count:", logEntry);

    return result;
  } catch (error) {
    console.error("🚀 ~ pushDataToClay ~ error:", error);
    throw error;
  }
}

async function getDetailsAPi(params: any) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      throw new Error('Failed to obtain access token');
    }
    
    const response: any = await axios.get(
      urlApiDetails + "?place_id=" + params?.placeId + "&key=" + apiKey,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      }
    );

    if (!response.data || !response.data.result) {
      throw new Error('Invalid response from Places API Details');
    }

    return response;
  } catch (error) {
    console.error("🚀 ~ pushDataToClay ~ error:", error);
    throw error;
  }
}
app.get("/getPlaces", async (req, res) => {
  try {
    const classValue: ClassApi = {
      latitude: toString(req.query.latitude),
      longitude: toString(req.query.longitude),
      radius: toString(req.query.radius),
      type: toString(req.query.type),
      uid: toString(req.query.uid),
      pageToken: toString(req.query.pagetoken),
      country: toString(req.query.country), // Optional value
      city: toString(req.query.city), // Optional value
      state: toString(req.query.state), // Optional value
      search: toString(req.query.search), // Optional value
    };

    // Fetch the payment record for the given UID
    const paymentQuerySnapshot = await db
      .collection("payments")
      .where("uid", "==", req.query.uid)
      .limit(1)
      .get();

    if (paymentQuerySnapshot.empty) {
      return res
        .status(404)
        .json({ error: "No payment record found for the given UID." });
    }

    const paymentDoc = paymentQuerySnapshot.docs[0];
    const paymentData = paymentDoc.data();

    // Retrieve the subscription details from Stripe
    // Check if payment data exists and has queriesCount for lifetime access
    if (!paymentData || !paymentData.queriesCount) {
      return res.status(400).json({ message: "Invalid payment record." });
    }

    // For lifetime access, no need to check subscription status
    if (paymentData.type === "lifetime") {
      // Continue with lifetime access
    }

    // Check the subscription status
    const paymentStatus = paymentData.status || "inactive"; // E.g., 'active', 'incomplete', 'past_due', 'canceled', 'unpaid'

    // Check if the subscription was canceled during the free trial
    if (
      paymentStatus !== "active" &&
      classValue.uid !== "TES2Ev5yDmM1iYva49OmBzhvOh03"
    ) {
      return res.status(400).json({
        message:
          "Your lifetime access is not active. Please purchase lifetime access to continue using the service.",
        status: "inactive",
      });
    }
    const resApi = await getPlacesApi(classValue);

    // Increment the queriesConsumed field
    const newQueriesConsumed = (paymentData.queriesConsumed || 0) + 1;

    await db.collection("payments").doc(paymentDoc.id).update({
      queriesConsumed: newQueriesConsumed,
    });

    //return data
    return res.status(200).json({
      data: resApi ?? [],
    });
  } catch (error) {
    const errorMessage = (error as Error).message;
    return res.status(500).json({ error: errorMessage });
  }
});

app.get("/getPhotoUrl", (req, res) => {
  const { photo_reference, maxwidth } = req.query;

  if (!photo_reference) {
    return res.status(400).json({ error: "Photo reference is required" });
  }

  const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${
    maxwidth || 400
  }&photoreference=${photo_reference}&key=${apiKey}`;

  return res.status(200).json({ photoUrl });
});

app.get("/getDetails", async (req, res) => {
  try {
    const placeId = req.query?.placeId ?? "";

    if (!placeId) {
      return res.status(400).json({ error: "Place id is required" });
    }

    const resApi = await getDetailsAPi({
      placeId: placeId,
    });
    const item = resApi?.data;
    const addressObject = getAddressSeparated(item?.result?.adr_address);
    return res.status(200).json({
      data: {
        name: item?.name,
        domain: "",
        phone: item.result?.formatted_phone_number,
        website: item.result?.website,
        address: {
          address1: addressObject?.streetAddress,
          address2: "",
          city: addressObject?.city,
          state: addressObject?.state,
          country: addressObject?.country,
          zipCode: addressObject?.zipCode,
        },
        numberOfEmployees: "",
        revenue: "",
        facebook: "",
        linkedin: "",
        site: item.result?.website,
        ...item?.result,
      },
      status: item?.status,
    });
  } catch (error) {
    const errorMessage = (error as Error).message;
    return res.status(500).json({ error: errorMessage });
  }
});

// api view model
app.get("/viewmodel/get", async (req, res) => {
  try {
    const countriesCollection = db.collection("states");
    const snapshot = await countriesCollection.get();

    if (snapshot.empty) {
      return res.status(404).send("No countries found");
    }

    const countries: any = [];
    snapshot.forEach((doc: any) => {
      countries.push({
        id: doc.id,
        ...doc.data(), // assuming fields are `value`, `name`, and `code`
      });
    });

    res.json(countries);
  } catch (error) {
    console.error("Error fetching countries:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/terms", async (req, res) => {
  try {
    const termsId = "terms-id"; // Get the ID from the request parameters
    const settingsCollection = db.collection("settings");
    const doc = await settingsCollection.doc(termsId).get();

    if (!doc.exists) {
      return res.status(404).send("Setting not found");
    }

    // Return the setting data
    return res.status(200).json({
      id: doc.id,
      ...doc.data(), // Assuming fields like `value`, `name`, etc.
    });
  } catch (error) {
    console.error("Error fetching setting:", error);
    res.status(500).send("Internal Server Error");
  }
});

// countries , States, Cities
const baseUrl = "https://countriesnow.space/api/v0.1/countries";

// 1. Get all countries
app.get("/countries", async (req, res) => {
  try {
    res.json({ countries: ["United States", "Canada"] });
  } catch (error) {
    console.error("Error fetching countries:", error);
    res.status(500).json({ error: "Failed to fetch countries" });
  }
});

// 2. Get states of a country
app.get("/states/:country", async (req, res) => {
  const country = req.params.country;

  try {
    const response = await axios.post(`${baseUrl}/states`, { country });
    const states = response.data.data.states;
    res.json({ states });
  } catch (error) {
    console.error("Error fetching states:", error);
    res.status(500).json({ error: `Failed to fetch states for ${country}` });
  }
});

// 3. Get cities of a state in a country
app.get("/cities/:country/:state", async (req, res) => {
  const { country, state } = req.params;

  try {
    const response = await axios.post(`${baseUrl}/state/cities`, {
      country,
      state,
    });
    const cities = response.data.data;
    res.json({ cities });
  } catch (error) {
    console.error("Error fetching cities:", error);
    res
      .status(500)
      .json({ error: `Failed to fetch cities for ${state}, ${country}` });
  }
});

//categories
app.get("/categories", async (req, res) => {
  const placeTypes = [
    "restaurant",
    "cafe",
    "library",
    "school",
    "park",
    "hospital",
    "museum",
    "shopping_mall",
    "stadium",
  ];
  try {
    res.json({ categories: placeTypes });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

//send mail registration

// Create a Nodemailer transporter using SMTP (Gmail in this case)
const transporter = nodemailer.createTransport({
  service: "gmail", // Or your preferred email service (Outlook, SMTP server, etc.)
  auth: {
    user: "support@adelphatech.com", // Your email address
    pass: "myln xoid mydk ojob", // Your email password or App-specific password if 2FA is enabled
  },
});

app.post("/send-email", async (req, res) => {
  const { email, firstName, lastName } = req.body;

  if (!email || !firstName || !lastName) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Compose the email
    const mailOptions = {
      from: "support@adelphatech.com", // Your email address
      to: email, // Recipient's email address
      subject: "Welcome to GMB Builder!",
      html: `
        <h4 style="text-align: start">Welcome, ${firstName} ${lastName}!</h4>
        <p>Thank you for creating an account with us. We're excited to have you on board!</p>
        <p>If you have any questions, feel free to reply to this email.</p>
        <p>Best regards,<br/>GMB Builder</p>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    // Return a success response
    return res
      .status(200)
      .json({ message: "Account created and welcome email sent!" });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ error: "Failed to send email" });
  }
});

// API route for sending a password reset email
app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    // Send password reset email
    await firebase.auth().generatePasswordResetLink(email);

    // Respond with success message
    return res
      .status(200)
      .json({ message: "Password reset email sent successfully" });
  } catch (error: any) {
    console.error("Error sending password reset email:", error);

    // Handle specific error codes
    if (error.code === "auth/user-not-found") {
      return res.status(404).json({ error: "User not found" });
    }

    return res
      .status(500)
      .json({ error: "Failed to send password reset email" });
  }
});

// Stripe
app.post("/create-subscription-link", async (req, res) => {
  try {
    const { queriesCount = 1943, email, uid } = req.query;

    if (!email || !uid) {
      return res.status(400).json({ error: "Email and UID are required" });
    }

    // Step 1: Create the Product
    const product = await stripe.products.create({
      name: "Lifetime Access",
      description:
        "Unlock the power of efficient local search with GMB Builder. Our tool empowers you to effortlessly find and explore a diverse range of places tailored to your needs. With our Lifetime Access plan, you get unlimited access to all features. Each purchase includes metadata to monitor your queries count, helping you optimize your searches and make informed business decisions.",
      metadata: {
        queriesCount: `${queriesCount}`, // Ensure metadata is a string
      },
    });
    console.log("Product created:", product.id);

    // Step 2: Create the Price (one-time payment)
    const price = await stripe.prices.create({
      unit_amount: 49900, // 499 USD in cents
      currency: "usd",
      product: product.id,
    });
    console.log("Price created:", price.id);

    // Step 3: Create a Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: email.toString().replace(" ", "+"),
      success_url: `https://gmb.adelphalabs.com/payment-success?uid=${uid}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: "https://gmb.adelphalabs.com/auth/login",
    });
    console.log("Checkout session created:", session.id);

    // Step 4: Respond with the Checkout URL
    res.json({
      url: session.url,
      product,
    });
  } catch (error: any) {
    console.error("Error creating payment link:", error?.message);
    res.status(500).json({ error: error?.message });
  }
});

// Store payment API
// app.post("/store-payment", async (req, res) => {
//   try {
//     const { sessionId, uid } = req.body; // Extract sessionId and uid from request body

//     if (!sessionId || !uid) {
//       return res.status(400).json({ message: "Missing sessionId or uid." });
//     }

//     // Retrieve user with the given uid
//     const userDoc = await db.collection("users").doc(uid).get();

//     if (!userDoc.exists) {
//       return res.status(404).json({ message: "User not found." });
//     }

//     // Check if payment with this sessionId already exists
//     const paymentQuerySnapshot = await db.collection("payments").where("sessionId", "==", sessionId).get();

//     if (!paymentQuerySnapshot.empty) {
//       return res.status(400).json({ message: "Payment already exists." });
//     }

//     // Retrieve the Stripe session
//     const session = await stripe.checkout.sessions.retrieve(sessionId);

//     if (!session || !session.subscription) {
//       return res.status(400).json({ message: "Invalid session or no subscription found." });
//     }

//     // Get subscription ID from session
//     const subsId = session.subscription;

//     // Add payment record to the 'payments' collection
//     await db.collection("payments").add({
//       sessionId,
//       subsId,
//       queriesCount: 1943,
//       queriesConsumed: 0,
//       uid, // Store the UID passed in the request
//       timestamp: new Date(),
//     });

//     res.status(200).json({ message: "Payment record stored successfully." });
//   } catch (error) {
//     console.error("Error storing payment:", error);
//     res.status(500).json({ message: "Failed to store payment." });
//   }
// });

//V2
app.post("/store-payment", async (req, res) => {
  try {
    const { sessionId, uid } = req.body; // Extract sessionId and uid from request body

    if (!sessionId || !uid) {
      return res.status(400).json({ message: "Missing sessionId or uid." });
    }

    // Retrieve user with the given uid
    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if payment with this sessionId already exists
    const paymentQuerySnapshot = await db
      .collection("payments")
      .where("sessionId", "==", sessionId)
      .get();

    if (!paymentQuerySnapshot.empty) {
      return res.status(400).json({ message: "Payment already exists." });
    }

    // Retrieve the Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== "paid") {
      return res
        .status(400)
        .json({ message: "Invalid session or payment not completed." });
    }

    // Add payment record to the 'payments' collection
    await db.collection("payments").add({
      sessionId,
      paymentId: session.payment_intent,
      queriesCount: 1943,
      queriesConsumed: 0,
      uid,
      paymentType: "lifetime", // Indicate this is a lifetime access payment
      amount: session.amount_total, // Store the payment amount
      currency: session.currency,
      timestamp: new Date(),
      status: "active", // Payment is active and valid
    });

    res.status(200).json({ message: "Payment record stored successfully." });
  } catch (error) {
    console.error("Error storing payment:", error);
    res.status(500).json({ message: "Failed to store payment." });
  }
});

// app.post("/check-payment", async (req, res) => {
//   try {
//     const { uid } = req.body; // Get the uid from the request body

//     if (!uid) {
//       return res.status(400).json({ message: "Missing uid." });
//     }

//     // Retrieve the payment document with the given uid from Firestore
//     const paymentSnapshot = await db.collection("payments").where("uid", "==", uid).get();

//     if (paymentSnapshot.empty) {
//       return res.status(404).json({ message: "Payment record not found for this user." });
//     }

//     // Assuming each user has only one payment document
//     const paymentDoc = paymentSnapshot.docs[0];
//     const { subsId } = paymentDoc.data(); // Get subsId from the payment document

//     if (!subsId) {
//       return res.status(400).json({ message: "No subsId found in payment record." });
//     }

//     // Retrieve the subscription details from Stripe
//     const subscription = await stripe.subscriptions.retrieve(subsId);

//     if (!subscription) {
//       return res.status(404).json({ message: "Subscription not found." });
//     }

//     // Check the subscription status
//     const paymentStatus = subscription.status; // E.g., 'active', 'incomplete', 'past_due', 'canceled', 'unpaid'

//     // Retrieve the payment method details (e.g., card details)
//     const paymentMethodId = subscription.default_payment_method;
//     let paymentMethod = null;

//     if (paymentMethodId) {
//       paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
//     }

//     // Get the card details if available
//     const card = paymentMethod?.card
//       ? {
//           brand: paymentMethod.card.brand, // E.g., 'visa'
//           last4: paymentMethod.card.last4, // Last 4 digits of the card
//           exp_month: paymentMethod.card.exp_month, // Expiry month
//           exp_year: paymentMethod.card.exp_year, // Expiry year
//           name: paymentMethod.billing_details.name, // Cardholder's name
//         }
//       : null;

//     // Get the date of the next payment (in UTC timestamp format)
//     const nextPaymentDate = subscription.current_period_end; // Time when the subscription will renew

//     // Check if the subscription has been canceled
//     const cancellationDate = subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null; // If canceled
//     const endDate = subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null; // If scheduled for cancellation

//     return res.status(200).json({
//       message: paymentStatus === "active" ? "Subscription is active." : "Subscription is not active.",
//       status: paymentStatus,
//       subsId: subsId,
//       card: card ? card : "No card information available.",
//       nextPaymentDate: nextPaymentDate ? new Date(nextPaymentDate * 1000).toISOString() : "No renewal date available.",
//       cancellationDate: cancellationDate ? cancellationDate : null,
//       endDate: endDate ? endDate : "No scheduled end date.",
//     });

//   } catch (error) {
//     console.error("Error checking payment status:", error);
//     res.status(500).json({ message: "Failed to check payment status." });
//   }
// });

//V2
app.post("/check-payment", async (req, res) => {
  try {
    const { uid } = req.body; // Get the uid from the request body

    if (!uid) {
      return res.status(400).json({ message: "Missing uid." });
    }

    // Retrieve the payment document with the given uid from Firestore
    const paymentSnapshot = await db
      .collection("payments")
      .where("uid", "==", uid)
      .get();

    if (paymentSnapshot.empty) {
      return res
        .status(404)
        .json({ message: "Payment record not found for this user." });
    }

    // Assuming each user has only one payment document
    const paymentDoc = paymentSnapshot.docs[0];
    const paymentData = paymentDoc.data();

    // Check if payment exists and has queriesCount
    if (!paymentData || !paymentData.queriesCount) {
      return res.status(400).json({ message: "Invalid payment record." });
    }

    // Return lifetime access details
    return res.status(200).json({
      paymentId: paymentData.paymentId,
      price: paymentData.amount,
      currency: paymentData.currency,
      status: "active", // Lifetime access is always active
      type: "lifetime",
      queriesCount: paymentData.queriesCount,
      queriesConsumed: paymentData.queriesConsumed || 0,
      queriesRemaining:
        paymentData.queriesCount - (paymentData.queriesConsumed || 0),
      purchaseDate: paymentData.timestamp
        ? new Date(paymentData.timestamp._seconds * 1000).toISOString()
        : null,
    });
  } catch (error) {
    console.error("Error checking payment status:", error);
    res.status(500).json({ message: "Failed to check payment status." });
  }
});

app.post("/create-portal-session", async (req, res) => {
  try {
    const { subsId, returnUrl } = req.body;

    if (!subsId || !returnUrl) {
      return res.status(400).json({ message: "Missing subsId or returnUrl." });
    }

    // Retrieve the subscription using subsId
    const subscription = await stripe.subscriptions.retrieve(subsId);

    if (!subscription || !subscription.customer) {
      return res
        .status(404)
        .json({ message: "Subscription or customer not found." });
    }

    // Extract the customerId from the subscription
    const customerId = subscription.customer;

    // Create a portal session for the customer
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId, // Stripe customer ID
      return_url: returnUrl, // The URL to redirect to after card update
    });

    // Send the portal URL to the client
    res.status(200).json({
      message: "Customer portal session created successfully.",
      url: portalSession.url, // The URL to redirect the customer to
    });
  } catch (error) {
    console.error("Error creating portal session:", error);
    res.status(500).json({ message: "Failed to create portal session." });
  }
});

app.post("/check-log-counts", async (req, res) => {
  try {
    const { uid } = req.body; // Get the uid from the request body

    if (!uid) {
      return res.status(400).json({ message: "Missing uid." });
    }
    // Retrieve the payment document with the given uid from Firestore
    const paymentSnapshot = await db
      .collection("payments")
      .where("uid", "==", uid)
      .get();

    if (paymentSnapshot.empty) {
      return res
        .status(404)
        .json({ message: "Payment record not found for this user." });
    }

    // Assuming each user has only one payment document
    const paymentDoc = paymentSnapshot.docs[0];
    const { subsId, queriesCount } = paymentDoc.data(); //
    const subscription = await stripe.subscriptions.retrieve(subsId);

    const periodStart = subscription?.current_period_start;
    const periodEnd = subscription?.current_period_end;

    // Convert Unix timestamps (in seconds) to Date objects
    const startDate = new Date(periodStart * 1000); // Multiply by 1000 to convert to milliseconds
    const endDate = new Date(periodEnd * 1000);
    // Retrieve the log documents with the given uid from Firestore
    const logSnapshot = await db
      .collection("logs") // Query the 'logs' collection
      .where("userId", "==", uid) // Find all logs related to this user// Match the user ID
      .where("timestamp", ">=", startDate) // Logs from September 1, 2024
      .where("timestamp", "<=", endDate)
      .get();

    if (logSnapshot.empty) {
      return res.status(404).json({ message: "No logs found for this user." });
    }

    // Assuming you're only interested in the first log (or change this logic as needed)
    const lengthDocs = logSnapshot.docs.length; // If there are multiple logs, you might need to handle this differently
    if (lengthDocs >= queriesCount) {
      // you have reached the limit
    }
    // Respond with the retrieved information
    return res.json({
      lengthDocs: lengthDocs, // Default to 0 if not found
    });
  } catch (error) {
    console.error("Error checking log counts:", error);
    res.status(500).json({ message: "Failed to check log counts." });
  }
});

app.listen(6465, () => {
  console.log("Api is running on port 5263");
});
