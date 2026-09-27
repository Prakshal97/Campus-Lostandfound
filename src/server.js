const express = require('express');
const path = require('path');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Frontend Files
app.use(express.static(path.join(__dirname, '../public')));

// Serve API Routes
app.use('/api/v1', apiRoutes);

// Fallback image generator for demo assets if missing
app.get('/assets/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../public/assets', filename);
  
  if (require('fs').existsSync(filePath)) {
    return res.sendFile(filePath);
  }

  // Generate dynamic SVG fallback card based on asset name
  let title = 'Campus Item';
  let icon = '📦';
  let bg = '#3730A3';

  if (filename.includes('earphones')) {
    title = 'Sony Earphones';
    icon = '🎧';
    bg = '#4338CA';
  } else if (filename.includes('calculator')) {
    title = 'Casio Calculator';
    icon = '🔢';
    bg = '#0369A1';
  } else if (filename.includes('id')) {
    title = 'Student ID Card';
    icon = '🪪';
    bg = '#BE123C';
  } else if (filename.includes('bottle')) {
    title = 'Water Bottle';
    icon = '🧴';
    bg = '#047857';
  }

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bg}" />
        <stop offset="100%" stop-color="#0F172A" />
      </linearGradient>
    </defs>
    <rect width="600" height="400" fill="url(#g)" />
    <circle cx="300" cy="170" r="70" fill="rgba(255,255,255,0.1)" />
    <text x="300" y="195" font-size="72" text-anchor="middle" dominant-baseline="middle">${icon}</text>
    <text x="300" y="290" font-family="system-ui, sans-serif" font-size="28" font-weight="bold" fill="#F8FAFC" text-anchor="middle">${title}</text>
    <text x="300" y="325" font-family="system-ui, sans-serif" font-size="16" fill="#94A3B8" text-anchor="middle">Reclaim Campus Verified Photo</text>
  </svg>`;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(svg);
});

// Fallback middleware to serve index.html for client-side routing
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Reclaim - Campus Lost & Found Web App Running!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`====================================================`);
});
