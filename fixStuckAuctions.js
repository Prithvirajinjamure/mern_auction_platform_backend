import { config } from "dotenv";
import { connection } from "./database/connection.js";
import { Auction } from "./models/auctionSchema.js";

config({
    path: "./config/config.env"
});

const fixStuckAuctions = async () => {
    try {
        console.log("🔧 Fixing stuck auctions...");
        await connection();
        
        const now = new Date();
        
        // Find all ended auctions that haven't been processed
        const stuckAuctions = await Auction.find({ 
            commissionCalculated: false,
            endTime: { $lt: now }
        });
        
        if (stuckAuctions.length === 0) {
            console.log("✅ No stuck auctions found!");
            process.exit(0);
        }
        
        console.log(`🔍 Found ${stuckAuctions.length} stuck auctions. Fixing...`);
        
        for (const auction of stuckAuctions) {
            console.log(`🔧 Fixing auction: ${auction.title} (ID: ${auction._id})`);
            
            // Mark as processed to prevent further email spam
            await Auction.findByIdAndUpdate(
                auction._id,
                { commissionCalculated: true },
                { new: true }
            );
            
            console.log(`✅ Marked auction ${auction._id} as processed`);
        }
        
        console.log(`\n🎉 Fixed ${stuckAuctions.length} stuck auctions!`);
        console.log("📧 This should stop the repeated email notifications.");
        
        process.exit(0);
        
    } catch (error) {
        console.error("❌ Error fixing stuck auctions:", error);
        process.exit(1);
    }
};

fixStuckAuctions();
