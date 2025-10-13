import nodeMailer from "nodemailer";

export const sendEmail = async ({ email, subject, message }) => {
  try {
    console.log('📧 Attempting to send email to:', email);
    
    let transporter;
    
    // Check if we're in production or development
    if (process.env.NODE_ENV === 'production') {
      // Use Gmail for production
      transporter = nodeMailer.createTransport({
        service: process.env.SMTP_SERVICE,
        auth: {
          user: process.env.SMTP_MAIL,
          pass: process.env.SMTP_PASSWORD,
        },
      });
    } else {
      // Use Ethereal Email for testing (creates fake emails you can view online)
      console.log('📧 Creating test email account...');
      let testAccount = await nodeMailer.createTestAccount();
      
      transporter = nodeMailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const options = {
      from: process.env.SMTP_MAIL || 'test@example.com',
      to: email,
      subject: subject,
      text: message,
    };

    console.log('📧 Sending email with options:', {
      from: options.from,
      to: options.to,
      subject: options.subject
    });

    const info = await transporter.sendMail(options);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('📧 ✅ Test email sent!');
      console.log('📧 Preview URL: %s', nodeMailer.getTestMessageUrl(info));
    } else {
      console.log('📧 ✅ Email sent successfully:', info.messageId);
    }
    
    return info;
  } catch (error) {
    console.error('📧 ❌ Email sending failed:', error.message);
    throw error;
  }
};
