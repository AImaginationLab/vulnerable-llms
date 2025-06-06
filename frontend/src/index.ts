#!/usr/bin/env node

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Parse command line arguments
const args = process.argv.slice(2);
const protocol = args[0] || 'http';
const port = parseInt(args[1] || '3000');

// Serve static files from the build directory (if it exists)
const buildPath = path.join(__dirname, '..', 'build');
app.use(express.static(buildPath));

// Serve static files from src directory for development
const srcPath = path.join(__dirname);
app.use('/src', express.static(srcPath));

// API proxy to backend (optional - for development)
app.use('/api', (req, res) => {
  // Proxy API requests to Python backend at localhost:5000
  const backendUrl = `http://localhost:5000${req.url}`;
  
  import('axios').then(({ default: axios }) => {
    axios({
      method: req.method,
      url: backendUrl,
      data: req.body,
      headers: req.headers,
    }).then(response => {
      res.status(response.status).json(response.data);
    }).catch(error => {
      if (error.response) {
        res.status(error.response.status).json(error.response.data);
      } else {
        res.status(500).json({ error: 'Backend connection failed' });
      }
    });
  });
});

// Serve index.html for all other routes (SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Frontend server running on ${protocol}://localhost:${port}`);
  console.log(`📁 Serving from: ${buildPath}`);
  console.log(`🔗 API proxy to: http://localhost:5000/api`);
});

export default app;