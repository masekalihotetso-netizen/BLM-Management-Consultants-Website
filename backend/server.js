const express = require('express');
const cors = require('cors');
const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

const app = express();
const PORT = process.env.PORT || 10000;

// Firebase Admin configuration.
// The service-account JSON will be stored as a secret on Render.
if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  console.error('FIREBASE_SERVICE_ACCOUNT_JSON is not configured.');
  process.exit(1);
}

let serviceAccount;

try {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
} catch (error) {
  console.error('FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON.');
  process.exit(1);
}

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
const auth = getAuth();

// Allowed website origins.
const allowedOrigins = [
  'https://blm-management-consultants.web.app',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests without an Origin header.
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  }
}));

app.use(express.json({ limit: '100kb' }));

async function requireAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';

  if (!token) {
    return res.status(401).json({ message: 'Administrator authentication is required.' });
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    if (decodedToken.admin !== true) {
      return res.status(403).json({ message: 'Administrator access is required.' });
    }
    req.user = decodedToken;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Your administrator session is invalid or expired.' });
  }
}

// Health check for Render.
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'BLM Management Consultants API'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'BLM Management Consultants API'
  });
});

// Receive a website contact/enquiry.
app.post('/api/contact', async (req, res) => {
  try {
    const { name, phone, service, message } = req.body || {};

    const cleanName = String(name || '').trim();
    const cleanPhone = String(phone || '').trim();
    const cleanService = String(service || '').trim();
    const cleanMessage = String(message || '').trim();

    if (!cleanName || !cleanPhone || !cleanService || !cleanMessage) {
      return res.status(400).json({
        message: 'Name, phone, service and message are required.'
      });
    }

    if (cleanName.length > 100) {
      return res.status(400).json({
        message: 'Name is too long.'
      });
    }

    if (cleanPhone.length > 50) {
      return res.status(400).json({
        message: 'Phone number is too long.'
      });
    }

    if (cleanService.length > 150) {
      return res.status(400).json({
        message: 'Service selection is too long.'
      });
    }

    if (cleanMessage.length > 5000) {
      return res.status(400).json({
        message: 'Message is too long.'
      });
    }

    const enquiry = {
      name: cleanName,
      phone: cleanPhone,
      service: cleanService,
      message: cleanMessage,
      status: 'New',
      createdAt: FieldValue.serverTimestamp()
    };

    const document = await db.collection('enquiries').add(enquiry);

    return res.status(201).json({
      message: 'Enquiry received.',
      enquiryId: document.id
    });

  } catch (error) {
    console.error('Could not save enquiry:', error);

    return res.status(500).json({
      message: 'The enquiry could not be saved.'
    });
  }
});

// Management endpoint.
// This will be protected before we expose it publicly.
app.get('/api/enquiries', requireAdmin, async (req, res) => {
  try {
    const snapshot = await db
      .collection('enquiries')
      .orderBy('createdAt', 'desc')
      .get();

    const enquiries = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    return res.json(enquiries);

  } catch (error) {
    console.error('Could not load enquiries:', error);

    return res.status(500).json({
      message: 'Enquiries could not be loaded.'
    });
  }
});

// Update enquiry status.
app.patch('/api/enquiries/:id', requireAdmin, async (req, res) => {
  try {
    const allowedStatuses = ['New', 'Contacted', 'Closed'];
    const { status } = req.body || {};

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Status must be New, Contacted or Closed.'
      });
    }

    const enquiryRef = db.collection('enquiries').doc(req.params.id);
    const document = await enquiryRef.get();

    if (!document.exists) {
      return res.status(404).json({
        message: 'Enquiry not found.'
      });
    }

    await enquiryRef.update({
      status
    });

    return res.json({
      message: 'Enquiry status updated.'
    });

  } catch (error) {
    console.error('Could not update enquiry:', error);

    return res.status(500).json({
      message: 'The enquiry status could not be updated.'
    });
  }
});

// Render requires the application to listen on its assigned port.
app.listen(PORT, '0.0.0.0', () => {
  console.log(`BLM Management Consultants API running on port ${PORT}`);
});