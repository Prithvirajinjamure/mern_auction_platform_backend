import { config } from "dotenv";
import { connection } from "./database/connection.js";
import { Auction } from "./models/auctionSchema.js";

config({
    path: "./config/config.env"
});

const checkAuctionsStatus = async () => {
    try {
        console.log("🔍 Checking auctions status...");
        await connection();
        
        const now = new Date();
        
        // Check all auctions
        const allAuctions = await Auction.find({});
        console.log(`📊 Total auctions in database: ${allAuctions.length}`);
        
        // Check ended auctions with commissionCalculated = false
        const problematicAuctions = await Auction.find({ 
            commissionCalculated: false,
            endTime: { $lt: now }
        });
        
        console.log(`⚠️  Ended auctions not processed: ${problematicAuctions.length}`);
        
        if (problematicAuctions.length > 0) {
            console.log("\nProblematic auctions details:");
            problematicAuctions.forEach((auction, index) => {
                console.log(`${index + 1}. ID: ${auction._id}`);
                console.log(`   Title: ${auction.title}`);
                console.log(`   End Time: ${auction.endTime}`);
                console.log(`   Commission Calculated: ${auction.commissionCalculated}`);
                console.log(`   Current Bid: ${auction.currentBid}`);
                console.log(`   Highest Bidder: ${auction.highestBidder || 'None'}`);
                console.log('   ---');
            });
            
            console.log("\n💡 These auctions might be causing repeated email notifications!");
        } else {
            console.log("\n✅ No problematic auctions found!");
        }
        
        // Check active auctions
        const activeAuctions = await Auction.find({
            startTime: { $lte: now },
            endTime: { $gt: now }
        });
        console.log(`🔥 Currently active auctions: ${activeAuctions.length}`);
        
        // Check future auctions
        const futureAuctions = await Auction.find({
            startTime: { $gt: now }
        });
        console.log(`📅 Future auctions: ${futureAuctions.length}`);
        
        process.exit(0);
        
    } catch (error) {
        console.error("❌ Error checking auctions:", error);
        process.exit(1);
    }
};

checkAuctionsStatus();
