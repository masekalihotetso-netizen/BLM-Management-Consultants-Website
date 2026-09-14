const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

const email = process.argv[2];
if (!email || !process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  console.error('Usage: set FIREBASE_SERVICE_ACCOUNT_JSON, then run: node scripts/set-admin.js admin@example.com');
  process.exit(1);
}

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
initializeApp({ credential: cert(serviceAccount) });

getAuth().getUserByEmail(email)
  .then(user => getAuth().setCustomUserClaims(user.uid, { admin: true }))
  .then(() => console.log(`Admin claim granted to ${email}.`))
  .catch(error => {
    console.error('Could not grant admin claim:', error.message);
    process.exitCode = 1;
  });
