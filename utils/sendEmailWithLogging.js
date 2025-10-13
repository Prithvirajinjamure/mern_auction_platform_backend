import { config } from "dotenv";
import { sendEmail } from "./utils/sendEmail.js";

config({
    path: "./config/config.env"
});

const originalSendEmail = sendEmail;

// Override the sendEmail function to add logging
const sendEmailWithLogging = async (emailData) => {
    const timestamp = new Date().toISOString();
    console.log(`\n📧 [EMAIL ALERT] ${timestamp}`);
    console.log(`   To: ${emailData.email}`);
    console.log(`   Subject: ${emailData.subject}`);
    console.log(`   Called from: ${new Error().stack.split('\n')[2].trim()}`);
    console.log(`   ----------------------------------------`);
    
    return await originalSendEmail(emailData);
};

// Export the enhanced function
export { sendEmailWithLogging as sendEmail };
