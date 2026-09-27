const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const store = require('../store/dataStore');
const { findMatchesForItem } = require('../services/matcher');
const { CAMPUS_ZONES } = require('../config/zones');

// Configure Multer storage
const uploadsDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, 'img_' + Date.now() + '_' + Math.floor(Math.random() * 1000) + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG/PNG/WebP) are allowed!'), false);
    }
  }
});

// GET /api/v1/zones
router.get('/zones', (req, res) => {
  res.json({ zones: CAMPUS_ZONES });
});

// POST /api/v1/items - Create lost/found report
router.post('/items', upload.single('photo'), (req, res) => {
  try {
    const {
      type,
      title,
      description,
      category,
      colour,
      brand,
      location,
      eventDate,
      custody,
      verifyQuestion,
      verifyAnswer,
      isSensitive,
      reportedBy,
      contactPreference
    } = req.body;

    if (!type || !title || !description || !category || !location) {
      return res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'Missing required fields: type, title, description, category, location.' } });
    }

    let imageUrl = '/assets/placeholder_item.jpg';
    if (req.file) {
      imageUrl = '/uploads/' + req.file.filename;
    }

    const newItem = store.addItem({
      type,
      title: title.trim(),
      description: description.trim(),
      category,
      colour: colour ? colour.trim() : '',
      brand: brand ? brand.trim() : '',
      location,
      eventDate: eventDate || new Date().toISOString(),
      imageUrl,
      isSensitive: isSensitive === 'true' || isSensitive === true,
      custody: custody || (type === 'found' ? 'with me' : 'with me'),
      verifyQuestion: verifyQuestion ? verifyQuestion.trim() : '',
      verifyAnswer: verifyAnswer ? verifyAnswer.trim() : '',
      reportedBy: reportedBy || 'user_aanya',
      contactPreference: contactPreference || 'in_app'
    });

    // Check for matches automatically and trigger notification if top match score >= 70
    const matches = findMatchesForItem(newItem, store.items, 50);
    if (matches.length > 0 && matches[0].score >= 70) {
      const topMatch = matches[0];
      store.addNotification({
        userId: newItem.reportedBy,
        title: `🎯 ${topMatch.score}% Match Discovered!`,
        message: `Potential match found for "${newItem.title}" at ${newItem.location.toUpperCase()}`,
        itemId: topMatch.item._id
      });
    }

    return res.status(201).json({ item: newItem, matches: matches.slice(0, 3) });
  } catch (err) {
    console.error('Error adding item:', err);
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// GET /api/v1/items - List and search items
router.get('/items', (req, res) => {
  const { type, category, location, status, q, page = 1, limit = 12 } = req.query;
  
  const items = store.getItems({ type, category, location, status, q });

  // Pagination
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const startIndex = (pageNum - 1) * limitNum;
  const paginatedItems = items.slice(startIndex, startIndex + limitNum);

  res.json({
    items: paginatedItems,
    total: items.length,
    page: pageNum,
    totalPages: Math.ceil(items.length / limitNum)
  });
});

// GET /api/v1/items/:id - Fetch single item with status history and claims
router.get('/items/:id', (req, res) => {
  const item = store.getItemById(req.params.id);
  if (!item) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Item not found' } });
  }

  const logs = store.getAuditLogs(item._id);
  const claims = store.getClaimsForItem(item._id);
  const matches = findMatchesForItem(item, store.items, 50);

  // Return item without sensitive verifyAnswerHash
  const safeItem = { ...item };
  delete safeItem.verifyAnswerHash;

  res.json({ item: safeItem, logs, claims, matches });
});

// PATCH /api/v1/items/:id - Update item status or details
router.patch('/items/:id', (req, res) => {
  const { status, actorId } = req.body;
  const updatedItem = store.updateItemStatus(req.params.id, status, actorId);
  if (!updatedItem) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Item not found' } });
  }
  res.json({ item: updatedItem });
});

// GET /api/v1/items/:id/matches - Top 3 match suggestions
router.get('/items/:id/matches', (req, res) => {
  const item = store.getItemById(req.params.id);
  if (!item) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Item not found' } });
  }

  const matches = findMatchesForItem(item, store.items, 40);
  res.json({ matches });
});

// POST /api/v1/items/:id/claims - Submit claim for an item
router.post('/items/:id/claims', (req, res) => {
  const item = store.getItemById(req.params.id);
  if (!item) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Item not found' } });
  }

  const { claimant, answer, markDescription } = req.body;
  if (!claimant || !markDescription) {
    return res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'Claimant and distinguishing mark description are required.' } });
  }

  const claim = store.addClaim({
    item: item._id,
    claimant: claimant || 'user_aanya',
    answer: answer || '',
    markDescription: markDescription.trim()
  });

  res.status(201).json({ claim });
});

// PATCH /api/v1/claims/:id - Approve or reject claim
router.patch('/claims/:id', (req, res) => {
  const { action, decidedBy } = req.body;
  
  if (action === 'approve') {
    const result = store.approveClaim(req.params.id, decidedBy || 'user_patil');
    if (!result) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Claim not found' } });
    }
    return res.json({ claim: result.claim, rawOtp: result.rawOtp });
  } else if (action === 'reject') {
    const claim = store.rejectClaim(req.params.id, decidedBy || 'user_patil');
    if (!claim) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Claim not found' } });
    }
    return res.json({ claim });
  } else {
    return res.status(400).json({ error: { code: 'INVALID_ACTION', message: 'Action must be "approve" or "reject".' } });
  }
});

// POST /api/v1/claims/:id/handover - Confirm handover with OTP
router.post('/claims/:id/handover', (req, res) => {
  const { otp, actorId } = req.body;
  if (!otp) {
    return res.status(400).json({ error: { code: 'INVALID_INPUT', message: '4-digit OTP is required.' } });
  }

  const result = store.verifyHandover(req.params.id, otp, actorId || 'user_patil');
  if (!result.success) {
    return res.status(400).json({ error: { code: 'VERIFICATION_FAILED', message: result.message } });
  }

  res.json({ message: 'Handover successfully verified and completed!', item: result.item, claim: result.claim });
});

// Auth OTP mock
router.post('/auth/request-otp', (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: { code: 'INVALID_EMAIL', message: 'Valid college email address required.' } });
  }
  res.json({ message: 'OTP sent to ' + email, demoOtp: '1234' });
});

router.post('/auth/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (otp === '1234') {
    const user = store.users.find(u => u.email === email) || {
      _id: 'user_' + Date.now(),
      name: email.split('@')[0].replace('.', ' '),
      email,
      role: 'student',
      verified: true
    };
    return res.json({ user, token: 'mock-jwt-token-' + Date.now() });
  }
  res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid OTP code.' } });
});

// GET /api/v1/me/notifications
router.get('/me/notifications', (req, res) => {
  const { userId = 'user_aanya' } = req.query;
  const notifications = store.getUserNotifications(userId);
  res.json({ notifications });
});

// PATCH /api/v1/me/notifications/:id/read
router.patch('/me/notifications/:id/read', (req, res) => {
  const notif = store.markNotificationRead(req.params.id);
  res.json({ notification: notif });
});

// GET /api/v1/admin/stats - Overview counts and heatmap density
router.get('/admin/stats', (req, res) => {
  const stats = store.getAdminStats();
  res.json({ stats, zones: CAMPUS_ZONES });
});

// POST /api/v1/admin/seed - Reset demo state
router.post('/admin/seed', (req, res) => {
  store.resetStore();
  res.json({ message: 'Demo data store successfully reset to default seed state!' });
});

module.exports = router;
