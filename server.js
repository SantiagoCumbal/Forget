console.log('=== STARTING APP ===');

try {
  const express = require('express');
  console.log('Express loaded OK');
  
  const path = require('path');
  console.log('Path loaded OK');
  
  const app = express();
  const PORT = process.env.PORT || 3000;
  
  console.log('Dirname:', __dirname);
  console.log('Public path:', path.join(__dirname, 'public'));
  
  app.use(express.static(path.join(__dirname, 'public')));
  
  // Endpoint to provide environment variables to client
  app.get('/api/config', (req, res) => {
    res.json({
      supabaseUrl: process.env.SUPABASE_URL || 'https://lnvevruftnmfmaswszvv.supabase.co',
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || 'sb_publishable_JnadYW9Wqs441mZjNLaJSA_9XKgUnQx'
    });
  });
  
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'reset-password.html'));
  });
  
  app.get('/reset-password', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'reset-password.html'));
  });
  
  // For local development
  if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, '0.0.0.0', () => {
      console.log('=== SERVER RUNNING ON PORT', PORT, '===');
    });
  }
  
  module.exports = app;
  
} catch (error) {
  console.log('=== ERROR ===');
  console.log(error);
}