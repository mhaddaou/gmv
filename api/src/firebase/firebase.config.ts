import { ConfigService } from '@nestjs/config';

// Default values for local development (replace with your actual development values)
const DEFAULT_PROJECT_ID = 'your-project-id';
const DEFAULT_CLIENT_EMAIL = 'your-client-email';
const DEFAULT_PRIVATE_KEY = 'your-private-key';
const DEFAULT_DATABASE_URL = 'https://your-project-id.firebaseio.com';

export const getFirebaseConfig = (configService?: ConfigService) => {
  // Process environment variables directly
  const projectId = process.env.FIREBASE_PROJECT_ID || DEFAULT_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || DEFAULT_CLIENT_EMAIL;
  
  // Extract private key directly from environment
  let privateKey = process.env.FIREBASE_PRIVATE_KEY || DEFAULT_PRIVATE_KEY;
  
  // Make sure the private key has proper newlines
  if (privateKey.includes('\\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }
  
  const databaseUrl = process.env.FIREBASE_DATABASE_URL || DEFAULT_DATABASE_URL;

  return {
    projectId,
    clientEmail,
    privateKey,
    databaseUrl
  };
}; 