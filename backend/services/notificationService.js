import nodemailer from 'nodemailer';

const createTransporter = () => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      debug: true,
      logger: true
    });

    return transporter;
  } catch (error) {
    throw error;
  }
};

export const sendWelcomeEmail = async (email, cosmeticName, cosmeticType) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return false;
  }

  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Fortnite Tracker" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Now tracking "${cosmeticName}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(45deg, #00C2FF, #FF4454); color: white; padding: 30px; text-align: center;">
            <h1>Fortnite Tracker</h1>
            <p>You're Now Tracking a Cosmetic!</p>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2>Thanks for using Fortnite Tracker! 🎉</h2>
            <p>We've successfully set up tracking for:</p>
            
            <div style="background: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0; border-left: 4px solid #00C2FF;">
              <div style="font-size: 48px; margin: 10px 0;">
                ${cosmeticType === 'skin' ? '👤' : 
                  cosmeticType === 'emote' ? '💃' : 
                  cosmeticType === 'pickaxe' ? '⛏️' : '🎒'}
              </div>
              <div style="color: #00C2FF; font-size: 24px; font-weight: bold; margin: 10px 0;">${cosmeticName}</div>
              <div style="color: #666; text-transform: capitalize;">${cosmeticType}</div>
            </div>

            <div style="background: #e8f4f8; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3>📧 What Happens Next?</h3>
              <p><strong>We'll monitor the Fortnite item shop daily</strong> and send you an email as soon as <strong>${cosmeticName}</strong> becomes available!</p>
              
              <h3>⏰ When We Check</h3>
              <p>• Daily at <strong>00:00 UTC</strong> (when the shop updates)<br>
                 • Immediate email notification when available</p>
              
              <h3>🎯 What You'll Receive</h3>
              <p>• Instant email when ${cosmeticName} is in the shop<br>
                 • Direct link to the Fortnite item shop<br>
                 • No spam - only important updates</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <p><strong>Stay ready! </strong> The item shop rotates daily, so your cosmetic could appear anytime!</p>
            </div>
          </div>
          
          <div style="text-align: center; color: #666; font-size: 12px; padding: 20px;">
            <p><strong>Fortnite Tracker</strong></p>
            <p>Not affiliated with Epic Games • This is a fan-made service</p>
          </div>
        </div>
      `,
      text: `
Thanks for using Fortnite Tracker! 🎉

We've successfully set up tracking for your cosmetic item:

🎮 ${cosmeticName} (${cosmeticType})

What Happens Next?
• We monitor the Fortnite item shop daily at 00:00 UTC
• You'll receive an immediate email when ${cosmeticName} becomes available
• Tracking stops automatically after notification

Stay ready! The item shop rotates daily, so your cosmetic could appear anytime.

---
Fortnite Tracker
Not affiliated with Epic Games
      `
    };

    const result = await transporter.sendMail(mailOptions);
    return true;

  } catch (error) {
    return false;
  }
};

export const sendCosmeticNotification = async (tracking, shopItem) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: `"Fortnite Tracker" <${process.env.EMAIL_USER}>`,
    to: tracking.email,
    subject: `🎉 "${tracking.cosmeticName}" is in the Fortnite Item Shop!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(45deg, #00C2FF, #FF4454); color: white; padding: 30px; text-align: center;">
          <h1>🎮 Fortnite Tracker</h1>
          <p>Your Cosmetic is Available!</p>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Good news! 🎉</h2>
          <p>Your tracked cosmetic is currently in the Fortnite item shop!</p>
          
          <div style="background: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
            <div style="font-size: 48px; margin: 10px 0;">
              ${tracking.cosmeticType === 'skin' ? '👤' : 
                tracking.cosmeticType === 'emote' ? '💃' : 
                tracking.cosmeticType === 'pickaxe' ? '⛏️' : '🎒'}
            </div>
            <div style="color: #00C2FF; font-size: 24px; font-weight: bold; margin: 10px 0;">${tracking.cosmeticName}</div>
          </div>

          <div style="text-align: center; margin: 20px 0;">
            <a href="https://www.fortnite.com/shop" style="background: #00C2FF; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Item Shop Now
            </a>
          </div>

          <p><strong>Hurry!</strong> The item shop rotates daily, so grab it before it's gone!</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    return false;
  }
};