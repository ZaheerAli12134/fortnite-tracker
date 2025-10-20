import express from 'express';
import Tracking from '../models/Tracking.js';
import { sendWelcomeEmail } from '../services/notificationService.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { cosmetic, contactInfo, notificationMethod } = req.body;
    
    if (!cosmetic || !contactInfo) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: cosmetic and contactInfo' 
      });
    }

    if (!contactInfo.includes('@')) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid email address' 
      });
    }

    const existingTracking = await Tracking.findOne({
      email: contactInfo.toLowerCase(),
      cosmeticId: cosmetic.id,
      isActive: true
    });

    if (existingTracking) {
      return res.status(409).json({ 
        success: false, 
        error: 'You are already tracking this cosmetic' 
      });
    }

    const tracking = new Tracking({
      email: contactInfo.toLowerCase(),
      cosmeticId: cosmetic.id,
      cosmeticName: cosmetic.name,
      cosmeticType: cosmetic.type
    });

    await tracking.save();

    sendWelcomeEmail(tracking.email, tracking.cosmeticName, tracking.cosmeticType)
      .then(() => console.log(`Welcome email sent to ${tracking.email}`))
      .catch(error => console.error(`Failed to send welcome email: ${error}`));

    res.status(201).json({ 
      success: true, 
      message: 'Tracking setup successfully! Check your email for confirmation.',
      trackingId: tracking._id,
      data: {
        id: tracking._id,
        email: tracking.email,
        cosmeticName: tracking.cosmeticName,
        createdAt: tracking.createdAt
      }
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create tracking' 
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const trackings = await Tracking.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.json({
      success: true,
      count: trackings.length,
      data: trackings
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch trackings' 
    });
  }
});

router.get('/cosmetic/:cosmeticId', async (req, res) => {
  try {
    const trackings = await Tracking.find({ 
      cosmeticId: req.params.cosmeticId,
      isActive: true 
    });
    
    res.json({
      success: true,
      count: trackings.length,
      data: trackings
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch trackings' 
    });
  }
});

router.get('/user/:email', async (req, res) => {
  try {
    const trackings = await Tracking.find({ 
      email: req.params.email.toLowerCase(),
      isActive: true 
    }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: trackings.length,
      data: trackings
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch trackings' 
    });
  }
});

router.delete('/:trackingId', async (req, res) => {
  try {
    const tracking = await Tracking.findByIdAndUpdate(
      req.params.trackingId,
      { isActive: false },
      { new: true }
    );

    if (!tracking) {
      return res.status(404).json({ 
        success: false, 
        error: 'Tracking not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Tracking cancelled successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to cancel tracking' 
    });
  }
});

export { router as trackingsRouter };