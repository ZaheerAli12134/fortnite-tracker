import cron from 'node-cron';
import { getCurrentItemShop } from './fortniteApi.js';
import { sendCosmeticNotification } from './notificationService.js';
import Tracking from '../models/Tracking.js';

const checkForTrackedItems = async () => {
  try {
    const currentShop = await getCurrentItemShop();
    
    if (!currentShop.items || currentShop.items.length === 0) {
      return;
    }
    
    const activeTrackings = await Tracking.find({ isActive: true });

    let notificationsSent = 0;
    let errors = 0;

    for (const tracking of activeTrackings) {
      try {
        const isInShop = currentShop.items?.some(item => {
          if (item.id === tracking.cosmeticId) {
            return true;
          }
          
          if (item.name.toLowerCase() === tracking.cosmeticName.toLowerCase()) {
            return true;
          }
          
          if (item.name.toLowerCase().includes(tracking.cosmeticName.toLowerCase()) || 
              tracking.cosmeticName.toLowerCase().includes(item.name.toLowerCase())) {
            return true;
          }
          
          return false;
        });

        if (isInShop) {
          const success = await sendCosmeticNotification(tracking, currentShop);
          
          if (success) {
            notificationsSent++;
          } else {
            errors++;
          }
        }
      } catch (error) {
        errors++;
      }
    }

  } catch (error) {
    console.error('Failed to check item shop:', error.message);
  }
};

const checkItemShopDaily = () => {
  cron.schedule('0 0 * * *', async () => {
    await checkForTrackedItems();
  }, {
    timezone: 'UTC'
  });
};

const manualShopCheck = async () => {
  await checkForTrackedItems();
};

export { checkItemShopDaily, manualShopCheck, checkForTrackedItems };
