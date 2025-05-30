import cron from "node-cron";
import { Auction } from "../models/auctionSchema.js";
import { User } from "../models/userSchema.js";
import { Bid } from "../models/bidSchema.js";
import { sendEmail } from "../utils/sendEmail.js";
import { calculateCommission } from "../controllers/commissionController.js";

export const endedAuctionCron = () => {
  cron.schedule("*/1 * * * *", async () => {
    try {
      const now = new Date();
      console.log("Cron for ended auction running...");
      
      // Debug all auctions first
      const allAuctions = await Auction.find({ commissionCalculated: false });
      
      // Filter ended auctions manually to handle the date format
      const endedAuctions = allAuctions.filter(auction => {
        const endTime = new Date(auction.endTime);
        return endTime < now;
      });

      console.log("Query parameters:", {
        currentTime: now.toString(),
        totalAuctions: allAuctions.length,
        endedAuctions: endedAuctions.length
      });

      console.log(`Found ${endedAuctions.length} ended auctions`);

      for (const auction of endedAuctions) {
        try {
          const commissionAmount = await calculateCommission(auction._id);
          auction.commissionCalculated = true;

          const highestBidder = await Bid.findOne({
            auctionItem: auction._id,
            amount: auction.currentBid,
          });

          const auctioneer = await User.findById(auction.createdBy);
          
          if (highestBidder) {
            auction.highestBidder = highestBidder.bidder.id;

            const bidder = await User.findById(highestBidder.bidder.id);
            
            // Validate bidder and email before sending
            if (!bidder || !bidder.email) {
              console.error(`Invalid bidder or missing email for auction: ${auction._id}`);
              console.log('Bidder details:', bidder);
              continue; // Skip to next auction
            }

            // Update user stats
            await User.findByIdAndUpdate(
              bidder._id,
              {
                $inc: {
                  moneySpent: highestBidder.amount,
                  auctionsWon: 1,
                },
              },
              { new: true }
            );

            // Update auctioneer commission
            await User.findByIdAndUpdate(
              auctioneer._id,
              {
                $inc: {
                  unpaidCommission: commissionAmount,
                },
              },
              { new: true }
            );

            // Add payment due date (7 days from now)
            // const paymentDueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString();
            
            const subject = `Congratulations! You won the auction for ${auction.title}`;
            const message = `Dear ${bidder.userName}, \n\nCongratulations! You have won the auction for ${auction.title}. \n\nBefore proceeding for payment contact your auctioneer via your auctioneer email: ${auctioneer.email} \n\nPlease complete your payment using one of the following methods:\n\n1. **Bank Transfer**: \n- Account Name: ${auctioneer.paymentMethods.bankTransfer.bankAccountName} \n- Account Number: ${auctioneer.paymentMethods.bankTransfer.bankAccountNumber} \n- Bank: ${auctioneer.paymentMethods.bankTransfer.bankName}\n\n2. **Easypaise**:\n- You can send payment via Easypaise: ${auctioneer.paymentMethods.easypaisa.easypaisaAccountNumber}\n\n3. **PayPal**:\n- Send payment to: ${auctioneer.paymentMethods.paypal.paypalEmail}\n\n4. **Cash on Delivery (COD)**:\n- If you prefer COD, you must pay 20% of the total amount upfront before delivery.\n- To pay the 20% upfront, use any of the above methods.\n- The remaining 80% will be paid upon delivery.\n- If you want to see the condition of your auction item then send your email on this: ${auctioneer.email}\n\nPlease ensure your payment is completed by [Payment Due Date]. Once we confirm the payment, the item will be shipped to you.\n\nThank you for participating!\n\nBest regards,\nZeeshu Auction Team`;

            console.log("SENDING EMAIL TO HIGHEST BIDDER");
            try {
              console.log(`Attempting to send email to: ${bidder.email}`);
              if (!bidder.email) {
                throw new Error('Bidder email is undefined');
              }
              
              await sendEmail({ 
                email: bidder.email, 
                subject, 
                message 
              });
              console.log(`Email sent successfully to: ${bidder.email}`);
            } catch (emailError) {
              console.error('Failed to send email:', emailError);
              console.error('Email details:', {
                recipientEmail: bidder.email,
                recipientId: bidder._id,
                auctionId: auction._id
              });
            }
          }

          // Save auction changes
          await auction.save();
          console.log(`Auction ${auction._id} processed successfully`);
          
        } catch (auctionError) {
          console.error(`Error processing auction ${auction._id}:`, auctionError);
        }
      }
    } catch (error) {
      console.error("Main cron job error:", error);
    }
  });
};





