import {catchAsyncErrors} from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import  { PaymentProof} from "../models/commissionProofSchema.js";
import { User } from "../models/userSchema.js";
import {v2 as cloudinary} from "cloudinary";
import {Auction} from "../models/auctionSchema.js"
import mongoose  from "mongoose";

export const calculateCommission = async (auctionId) =>
{
    const auction = await Auction.findById(auctionId);
    if(!mongoose.Types.ObjectId.isValid(auctionId)){
       return next(new ErrorHandler("Invalid auction ID format",400)); 
    }
    const commissionRate = 0.05;
    const commission = auction.currentBid * commissionRate;
  
    
    return commission; 
};


export const proofOfCommission = catchAsyncErrors(async (req, res, next) => {
        if(!req.files || Object.keys(req.files).length === 0){
               return next(new ErrorHandler("payment proof screenshot is required",400)); 
        }
        const {proof} = req.files;
        const {amount, comment} = req.body;
// Remove this duplicate user declaration since it's already declared below

        // if(!parsedAmount || !comment){
        //     return next(new ErrorHandler("amount and comment are required", 400));
        // }

        // Use parsedAmount instead of amount in the rest of your code
        const user = await User.findById(req.user._id);

        if(!amount || !comment){
            return next(new ErrorHandler("amount and comment are required",400));
        }

        if(user.unpaidCommission === 0){
            return res.status(200).json({
                success : true,
                message : "you dont have any unpaid commission",
            }); 
        }

        if(user.unpaidCommission < amount){
                 return next(new ErrorHandler(
                    `the amount exceeds your unpaid commission balance.please enter an amount up to ${user.unpaidCommission}`,403)); 
        }

        const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
        if (!allowedFormats.includes(proof.mimetype)) {
            return next(new ErrorHandler("screenshot format not supported ", 400));
        }


        const cloudinaryRespones = await cloudinary.uploader.upload(
            proof.tempFilePath,
            {
                folder: "MERN_AUCTION_PLATFORM_PAYMENT_PROOF",
            }
        );
    
        if (!cloudinaryRespones || cloudinaryRespones.error) {
            console.error("Cloudinary error:",
                cloudinaryRespones.error || "Unknown cloudinary error"
            );
    
            return next(new ErrorHandler("Failed to upload payment proof.", 500)
            );
        }

        const commissionProof = await PaymentProof.create({
            userId : req.user._id,
            proof : {
                public_id : cloudinaryRespones.public_id,
                url : cloudinaryRespones.secure_url,
            },
            amount,
            comment,
        });

        res.status(201).json({
               success : true,
              message : "payment proof submitted successfully.we will review it shortly.", 
              commissionProof,
        });
    
});


























