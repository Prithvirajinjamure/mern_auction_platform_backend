import express from "express";
import { sendEmail } from "../utils/sendEmail.js";

const router = express.Router();

// Test email endpoint for real Gmail sending
router.post("/send-real-email", async (req, res) => {
  try {
    const { email, subject, message } = req.body;
    
    console.log('🧪 Real email test endpoint called');
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }
    
    const testSubject = subject || "🎉 Test Email from Prime Bid Auction Platform";
    const testMessage = message || `Hello from Prime Bid!

This is a test email to verify that our email system is working correctly with Gmail.

If you're receiving this email, it means:
✅ Gmail SMTP is properly configured
✅ App Password is working
✅ Email sending functionality is operational

Test details:
- Sent at: ${new Date().toISOString()}
- From: Prime Bid Auction Platform
- Email System: Gmail SMTP

Best regards,
Prime Bid Team`;

    console.log('🧪 Attempting to send real email...');
    await sendEmail({
      email,
      subject: testSubject,
      message: testMessage
    });
    
    res.status(200).json({
      success: true,
      message: `✅ Real email sent successfully to ${email}! Check your inbox.`
    });
    
  } catch (error) {
    console.error('❌ Real email test failed:', error);
    res.status(500).json({
      success: false,
      message: "Failed to send real email",
      error: error.message
    });
  }
});

export default router;
