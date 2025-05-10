import * as admin from 'firebase-admin';
import { getFirebaseConfig } from './firebase.config';
// Import the service account with type annotation to fix the TypeScript error
import * as serviceAccountFile from './serviceAccount.json';

// Define the type for the service account
interface ServiceAccount {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

// Cast the imported JSON to the ServiceAccount type
const serviceAccount = serviceAccountFile as unknown as ServiceAccount;

/**
 * Initialize Firebase Admin SDK with the correct runtime
 */
export const initializeFirebase = () => {
  // Get Firebase configuration from environment
  const { databaseUrl } = getFirebaseConfig();
  
  // Check if already initialized
  if (!admin.apps.length) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        databaseURL: databaseUrl,
      });
      
      console.log('Firebase initialized successfully');
      return true;
    } catch (error) {
      console.error('Firebase initialization error:', error);
      throw error;
    }
  }
  
  return false;
}; 