export default () => ({
  port: parseInt(process.env.PORT || '6465', 10),
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    databaseUrl: process.env.FIREBASE_DATABASE_URL,
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    testSecretKey: process.env.STRIPE_TEST_SECRET_KEY,
  },
  google: {
    mapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
  },
  email: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
}); 