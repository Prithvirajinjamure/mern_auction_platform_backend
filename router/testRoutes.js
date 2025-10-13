import express from "express";
import { sendEmail } from "../utils/sendEmail.js";

const router = express.Router();

// Test email endpoint
router.post("/test-email", async (req, res) => {
  try {
    const { email, subject, message } = req.body;
    
    console.log('📧 Test email endpoint called with:', {
      email,
      subject,
      messageLength: message?.length
    });
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }
    
    const testSubject = subject || "Test Email from Auction Platform";
    const testMessage = message || `Hello! This is a test email from your auction platform.
    
If you're receiving this, the email functionality is working correctly.

Test details:
- Sent at: ${new Date().toISOString()}
- From: Prime Bid Auction Platform

Best regards,
Prime Bid Team`;

    await sendEmail({
      email,
      subject: testSubject,
      message: testMessage
    });
    
    res.status(200).json({
      success: true,
      message: `Test email sent successfully to ${email}`
    });
    
  } catch (error) {
    console.error('❌ Test email failed:', error);
    res.status(500).json({
      success: false,
      message: "Failed to send test email",
      error: error.message
    });
  }
});

export default router;
