import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { trackingsRouter } from './routes/trackings.js';
import { checkItemShopDaily, manualShopCheck } from './services/shopChecker.js';
import { sendWelcomeEmail } from './services/notificationService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Atlas Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

app.use('/api/trackings', trackingsRouter);

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

app.get('/api/test-email', async (req, res) => {
  try {
    const { email } = req.query;
    const testEmail = email || process.env.EMAIL_USER;
    
    const success = await sendWelcomeEmail(
      testEmail,
      'Test Cosmetic',
      'skin'
    );
    
    if (success) {
      res.json({ success: true, message: 'Test email sent! Check your inbox.' });
    } else {
      res.json({ success: false, message: 'Test email failed. Check server logs.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/manual-shop-check', async (req, res) => {
  try {
    await manualShopCheck();
    res.json({ success: true, message: 'Manual shop check completed. Check server logs.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/debug/trackings', async (req, res) => {
  try {
    const trackings = await mongoose.connection.db.collection('trackings').find({}).toArray();
    res.json({
      success: true,
      count: trackings.length,
      data: trackings
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const startServer = async () => {
  await connectDB();
  
  checkItemShopDaily();
  
  app.listen(PORT, () => {
    console.log(`🚀 Backend server running on port ${PORT}`);
    console.log(`⏰ Shop checks scheduled for 00:00 UTC daily`);
  });
};

startServer();