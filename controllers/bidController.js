import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Auction } from "../models/auctionSchema.js";
import { Bid } from "../models/bidSchema.js";
import { User } from "../models/userSchema.js";


export const placeBid = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const auctionItem = await Auction.findById(id);


  if (!auctionItem) {
    return next(new ErrorHandler("Auction Item not found.", 404));
  }


  const { amount } = req.body;


  if (!amount) {
    return next(new ErrorHandler("Please place your bid.", 404));
  }

  if (amount <= auctionItem.currentBid) {
    return next(
      new ErrorHandler("Bid amount must be greater than the current bid.", 404)
    );
  }



  if (amount < auctionItem.startingBid) {
    return next(
      new ErrorHandler("Bid amount must be greater than starting bid.", 404)
    );
  }

  try {
    const existingBid = await Bid.findOne({
      "bidder.id": req.user._id,
      auctionItem: auctionItem._id,
    });

    const existingBidInAuction = auctionItem.bids.find(
      (bid) => bid.userId.toString() == req.user._id.toString()
    );

    if (existingBid && existingBidInAuction) {
      existingBidInAuction.amount = amount;
      existingBid.amount = amount;
      await existingBidInAuction.save();
      await existingBid.save();
      auctionItem.currentBid = amount;
    } else {
      const bidderDetail = await User.findById(req.user._id);
      const bid = await Bid.create({
        amount,
        bidder: {
          id: bidderDetail._id,
          userName: bidderDetail.userName,
          profileImage: bidderDetail.profileImage?.url,
        },
        auctionItem: auctionItem._id,
      });
      auctionItem.bids.push({
        userId: req.user._id,
        userName: bidderDetail.userName,
        profileImage: bidderDetail.profileImage?.url,
        amount,
      });
      auctionItem.currentBid = amount;
    }
    await auctionItem.save();

    res.status(201).json({
      success: true,
      message: "Bid placed.",
      currentBid: auctionItem.currentBid,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message || "Failed to place bid.", 500));
  }
});




















// export const placeBid = catchAsyncErrors(async (req, res, next) => {

//   const { id } = req.params;
//   const auctionItem = await Auction.findById(id);
  
//   if (!auctionItem) {
//     return next(new ErrorHandler("Auction Item not found.", 404));
//   }

//   // Prevent self-bidding
//   if (auctionItem.createdBy.toString() === req.user._id.toString()) {
//     return next(new ErrorHandler("You cannot bid on your own auction.", 400));
//   }

//   // Check if auction is active
//   const now = new Date();
//   if (now < new Date(auctionItem.startTime)) {
//     return next(new ErrorHandler("Auction has not started yet.", 400));
//   }
//   if (now > new Date(auctionItem.endTime)) {
//     return next(new ErrorHandler("Auction has ended.", 400));
//   }

//   const { amount } = req.body;
//   if (!amount) {
//     return next(new ErrorHandler("Please place your bid.", 400));
//   }

//   // Improved bid amount validation
//   if (isNaN(amount) || amount <= 0) {
//     return next(new ErrorHandler("Bid amount must be a positive number.", 400));
//   }
//   if (amount <= auctionItem.currentBid) {
//     return next(new ErrorHandler("Bid amount must be greater than the current bid.", 400));
//   }
//   if (amount < auctionItem.startingBid) {
//     return next(new ErrorHandler("Bid amount must be greater than starting bid.", 400));
//   }

//   try {
//     // Start a session for transaction
//     const session = await mongoose.startSession();
//     session.startTransaction();

//     try {
//       const existingBid = await Bid.findOne({
//         "bidder.id": req.user._id,
//         auctionItem: auctionItem._id,
//       }).session(session);

//       const existingBidInAuction = auctionItem.bids.find(
//         (bid) => bid.userId.toString() === req.user._id.toString()
//       );

//       if (existingBid && existingBidInAuction) {
//         existingBidInAuction.amount = amount;
//         existingBid.amount = amount;
//         await existingBid.save({ session });
//         auctionItem.currentBid = amount;
//       } else {
//         const bidderDetail = await User.findById(req.user._id).session(session);
//         const bid = await Bid.create([{
//           amount,
//           bidder: {
//             id: bidderDetail._id,
//             userName: bidderDetail.userName,
//             profileImage: bidderDetail.profileImage?.url,
//           },
//           auctionItem: auctionItem._id,
//         }], { session });

//         auctionItem.bids.push({
//           userId: req.user._id,
//           userName: bidderDetail.userName,
//           profileImage: bidderDetail.profileImage?.url,
//           amount,
//         });
//         auctionItem.currentBid = amount;
//       }
      
//       await auctionItem.save({ session });
//       await session.commitTransaction();

//       res.status(201).json({
//         success: true,
//         message: "Bid placed successfully.",
//         currentBid: auctionItem.currentBid,
//       });
//     } catch (error) {
//       await session.abortTransaction();
//       throw error;
//     } finally {
//       session.endSession();
//     }
//   } catch (error) {
//     return next(new ErrorHandler(error.message || "Failed to place bid.", 500));
//   }
// });
