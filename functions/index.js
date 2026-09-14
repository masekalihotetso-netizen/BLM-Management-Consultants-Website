const express = require('express');
const cors = require('cors');
const {onRequest} = require('firebase-functions/v2/https');
const {getFirestore, FieldValue} = require('firebase-admin/firestore');
const {getAuth} = require('firebase-admin/auth');
const {initializeApp} = require('firebase-admin/app');

initializeApp();
const database = getFirestore();
const auth = getAuth();
const app = express();
const allowedStatuses = ['New', 'Contacted', 'Closed'];

app.use(cors());
app.use(express.json({limit: '1mb'}));

async function requireAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';

  if (!token) return res.status(401).json({message: 'Administrator authentication is required.'});

  try {
    const decodedToken = await auth.verifyIdToken(token);
    if (decodedToken.admin !== true) return res.status(403).json({message: 'Administrator access is required.'});
    req.user = decodedToken;
    return next();
  } catch (error) {
    return res.status(401).json({message: 'Your administrator session is invalid or expired.'});
  }
}

app.get(['/health', '/api/health'], (req, res) => {
  res.json({status: 'ok', service: 'BLM Management Consultants API'});
});

app.post(['/contact', '/api/contact'], async (req, res) => {
  const {name, phone, service, message} = req.body || {};
  if (!name || !phone || !service || !message) {
    return res.status(400).json({message: 'Name, phone, service and message are required.'});
  }

  try {
    const enquiry = {
      name: String(name).trim(),
      phone: String(phone).trim(),
      service: String(service).trim(),
      message: String(message).trim(),
      status: 'New',
      createdAt: FieldValue.serverTimestamp()
    };
    const reference = await database.collection('enquiries').add(enquiry);
    res.status(201).json({message: 'Enquiry received.', enquiryId: reference.id});
  } catch (error) {
    console.error('Could not save enquiry:', error);
    res.status(500).json({message: 'The enquiry could not be saved.'});
  }
});

app.get(['/enquiries', '/api/enquiries'], requireAdmin, async (req, res) => {
  try {
    const snapshot = await database.collection('enquiries').orderBy('createdAt', 'desc').get();
    res.json(snapshot.docs.map((document) => ({id: document.id, ...document.data()})));
  } catch (error) {
    console.error('Could not load enquiries:', error);
    res.status(500).json({message: 'Enquiries could not be loaded.'});
  }
});

app.patch(['/enquiries/:id', '/api/enquiries/:id'], requireAdmin, async (req, res) => {
  const {status} = req.body || {};
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({message: 'Status must be New, Contacted or Closed.'});
  }

  try {
    const reference = database.collection('enquiries').doc(req.params.id);
    const document = await reference.get();
    if (!document.exists) return res.status(404).json({message: 'Enquiry not found.'});
    await reference.update({status});
    res.json({message: 'Enquiry status updated.'});
  } catch (error) {
    console.error('Could not update enquiry:', error);
    res.status(500).json({message: 'The enquiry status could not be updated.'});
  }
});

exports.api = onRequest(app);
