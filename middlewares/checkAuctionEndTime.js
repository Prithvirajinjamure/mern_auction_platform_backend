import mongoose from "mongoose";
import { catchAsyncErrors } from "./catchAsyncErrors.js";
import ErrorHandler from "./error.js";
import { Auction } from "../models/auctionSchema.js";

export const checkAuctionEndTime = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorHandler("Invalid ID Format", 400));
  }

  const auction = await Auction.findById(id);
  if (!auction) {
    return next(new ErrorHandler("Auction not found", 404));
  }

  // --- CORRECTED LOGIC ---
  // We use .getTime() and Date.now() to compare raw millisecond timestamps.
  // This is timezone-agnostic and reliable.

  if (auction.startTime.getTime() > Date.now()) {
    return next(new ErrorHandler("Auction has not started yet", 400));
  }

  if (auction.endTime.getTime() < Date.now()) {
    return next(new ErrorHandler("Auction has ended", 400));
  }
  // --- END OF CORRECTION ---

  next();
});
