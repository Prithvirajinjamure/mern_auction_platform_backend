import cron from "node-cron";
import { Auction } from "../models/auctionSchema.js";
import { User } from "../models/userSchema.js";
import { Bid } from "../models/bidSchema.js";
import { sendEmail } from "../utils/sendEmailTest.js"; // Using test version
import { calculateCommission } from "../controllers/commissionController.js";
import { emitAuctionStatus } from "../socket/index.js";

export const endedAuctionCron = () => {
  // Run every minute to check for ended auctions
  cron.schedule("*/1 * * * *", async () => {
    try {
      const now = new Date();
      console.log("🔔 Cron for ended auction running at:", now.toISOString());
      
      // Since endTime is stored as String, we need to get all unprocessed auctions first
      // then filter them manually by converting string dates to Date objects
      const allAuctions = await Auction.find({ 
        commissionCalculated: false
      });
      
      console.log(`📋 Found ${allAuctions.length} unprocessed auctions to check`);
      
      // Filter ended auctions by manually comparing dates
      const endedAuctions = allAuctions.filter(auction => {
        try {
          const endTime = new Date(auction.endTime);
          const isEnded = endTime < now;
          if (isEnded) {
            console.log(`⏰ Auction "${auction.title}" (${auction._id}) ended at: ${endTime.toISOString()}`);
          }
          return isEnded;
        } catch (dateError) {
          console.error(`❌ Invalid date format for auction ${auction._id}: ${auction.endTime}`);
          return false;
        }
      });

      console.log("📊 Query results:", {
        currentTime: now.toISOString(),
        totalUnprocessedAuctions: allAuctions.length,
        endedAuctions: endedAuctions.length
      });

      if (endedAuctions.length === 0) {
        console.log("✅ No ended auctions found to process at this time.");
        return;
      }

      console.log(`🚀 Processing ${endedAuctions.length} ended auctions...`);

      for (const auction of endedAuctions) {
        try {
          console.log(`🔄 Processing auction: ${auction._id} - "${auction.title}"`);
          
          // Check if this auction has already been processed to avoid duplicates
          if (auction.commissionCalculated) {
            console.log(`⚠️ Auction ${auction._id} already processed, skipping...`);
            continue;
          }

          const commissionAmount = await calculateCommission(auction._id);
          console.log(`💰 Commission calculated: ${commissionAmount}`);

          const highestBidder = await Bid.findOne({
            auctionItem: auction._id,
            amount: auction.currentBid,
          });

          console.log(`🎯 Highest bidder found:`, highestBidder ? {
            id: highestBidder.bidder.id,
            userName: highestBidder.bidder.userName,
            amount: highestBidder.amount
          } : 'None');

          const auctioneer = await User.findById(auction.createdBy);
          console.log(`👤 Auctioneer:`, auctioneer ? auctioneer.userName : 'Not found');
          
          if (highestBidder) {
            auction.highestBidder = highestBidder.bidder.id;

            const bidder = await User.findById(highestBidder.bidder.id);
            console.log(`🏆 Winner details:`, bidder ? {
              id: bidder._id,
              userName: bidder.userName,
              email: bidder.email
            } : 'Bidder not found');
            
            // Validate bidder and email before sending
            if (!bidder || !bidder.email) {
              console.error(`❌ Invalid bidder or missing email for auction: ${auction._id}`);
              console.log('Bidder details:', bidder);
              
              // Mark as processed even if no email can be sent to avoid infinite loop
              auction.commissionCalculated = true;
              await auction.save();
              continue;
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

            const subject = `Congratulations! You won the auction for ${auction.title}`;
            const message = `Dear ${bidder.userName}, \n\nCongratulations! You have won the auction for ${auction.title}. \n\nBefore proceeding for payment contact your auctioneer via your auctioneer email: ${auctioneer.email} \n\nPlease complete your payment using one of the following methods:\n\n1. **Bank Transfer**: \n- Account Name: ${auctioneer.paymentMethods.bankTransfer.bankAccountName} \n- Account Number: ${auctioneer.paymentMethods.bankTransfer.bankAccountNumber} \n- Bank: ${auctioneer.paymentMethods.bankTransfer.bankName}\n\n2. **Easypaise**:\n- You can send payment via Easypaise: ${auctioneer.paymentMethods.easypaisa.easypaisaAccountNumber}\n\n3. **PayPal**:\n- Send payment to: ${auctioneer.paymentMethods.paypal.paypalEmail}\n\n4. **Cash on Delivery (COD)**:\n- If you prefer COD, you must pay 20% of the total amount upfront before delivery.\n- To pay the 20% upfront, use any of the above methods.\n- The remaining 80% will be paid upon delivery.\n- If you want to see the condition of your auction item then send your email on this: ${auctioneer.email}\n\nPlease ensure your payment is completed by [Payment Due Date]. Once we confirm the payment, the item will be shipped to you.\n\nThank you for participating!\n\nBest regards,\nZeeshu Auction Team`;

            console.log(`📧 SENDING EMAIL TO HIGHEST BIDDER: ${bidder.email} for auction: ${auction._id}`);
            try {
              await sendEmail({ 
                email: bidder.email, 
                subject, 
                message 
              });
              console.log(`✅ Email sent successfully to: ${bidder.email} for auction: ${auction._id}`);
            } catch (emailError) {
              console.error(`❌ Failed to send email for auction ${auction._id}:`, emailError);
              console.error('Email details:', {
                recipientEmail: bidder.email,
                recipientId: bidder._id,
                auctionId: auction._id,
                errorMessage: emailError.message
              });
              // Don't throw error here, just log it and continue with marking as processed
            }

            // Emit auction ended status to room
            try {
              emitAuctionStatus(auction._id.toString(), {
                auctionId: auction._id,
                status: "ended",
                winner: {
                  id: bidder._id,
                  userName: bidder.userName,
                },
                finalAmount: highestBidder.amount,
              });
            } catch {}
          } else {
            console.log(`⚠️ No highest bidder found for auction: ${auction._id}`);
            // Emit auction ended with no winner
            try {
              emitAuctionStatus(auction._id.toString(), {
                auctionId: auction._id,
                status: "ended",
                winner: null,
                finalAmount: auction.currentBid,
              });
            } catch {}
          }

          // IMPORTANT: Only mark as processed AFTER all operations are complete
          auction.commissionCalculated = true;
          await auction.save();
          console.log(`✅ Auction ${auction._id} processed successfully and marked as complete`);
          
        } catch (auctionError) {
          console.error(`❌ Error processing auction ${auction._id}:`, auctionError);
          console.error('Stack trace:', auctionError.stack);
          // Even if there's an error, mark as processed to avoid infinite retries
          try {
            auction.commissionCalculated = true;
            await auction.save();
            console.log(`⚠️ Marked auction ${auction._id} as processed despite error to prevent infinite loop`);
          } catch (saveError) {
            console.error(`❌ Failed to mark auction ${auction._id} as processed:`, saveError);
          }
        }
      }
    } catch (error) {
      console.error("❌ Main cron job error:", error);
      console.error('Stack trace:', error.stack);
    }
  });
};





