import { Auction } from "../models/auctionSchema.js";
import { User } from "../models/userSchema.js";
import {Bid} from "../models/bidSchema.js"
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";  // Changed this line
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";

export const addNewAuction = catchAsyncErrors(async (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return next(new ErrorHandler("Aucation item Image required.", 400));
    }

    const { image } = req.files;

    const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedFormats.includes(image.mimetype)) {
        return next(new ErrorHandler("file format not supported", 400));
    }

    const { title,
        description,
        category,
        condition,
        startingBid,
        startTime,
        endTime } = req.body;

    if (!title || !description || !category || !condition || !startingBid || !startTime || !endTime) {
        return next(new ErrorHandler("please provide all details.", 400));
    }

    if (new Date(startTime) < Date.now()) {
        return next(new ErrorHandler
            ("Auction start time should be greater than current time.", 400));
    }

    if (new Date(startTime) >= new Date(endTime)) {
        return next(new ErrorHandler
            ("Auction start time should be lesser than ending time.", 400));
    }

    const alredyOneAuctionActive = await Auction.findOne({
        createdBy: req.user._id,
        endTime: { $gt: Date.now() },
    });

    if (alredyOneAuctionActive) {
        return next(new ErrorHandler
            ("You can't create new auction, you have one auction active.", 400));
    }



    try 
    {
        const cloudinaryRespones = await cloudinary.uploader.upload
        (
            image.tempFilePath,
            {
                folder: "MERN_AUCTION_PLATFORM_AUCTIONS",
            }
        );

        if (!cloudinaryRespones || cloudinaryRespones.error) 
        {
            console.error
            ("Cloudinary error:",
                cloudinaryRespones.error || "Unknown cloudinary error"
            );

            return next
            (new ErrorHandler("Failed to upload auction image to cloudinary.", 500)
            );
        }
    

    const auctionItem = await Auction.create({
        title,
        description,
        category,
        condition,
        startingBid,
        startTime,
        endTime,
        createdBy: req.user._id,
        image: {
            public_id: cloudinaryRespones.public_id,
            url: cloudinaryRespones.secure_url,
        },
    });
    return res.status(201).json({
        success: true,
        message : `Auction item created and will be listed on auction page at ${startTime}.`,
        auctionItem,
    });
}
    catch (error) {
        return next(new ErrorHandler( error.message ||"Failed to upload auction image to cloudinary.", 500));
    }
});


export const getAllItems = catchAsyncErrors(async (req, res, next) => {
    let items = await Auction.find();
    res.status(200).json({
        success: true,
        items,
    });
});


export const getAuctionDetails = catchAsyncErrors(async (req, res, next) => {
    const {id} = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return next(new ErrorHandler("Invalid ID Format .", 400));
    }
    const auctionItem = await Auction.findById(id);

    if(!auctionItem){
        return next(new ErrorHandler("Auction item not found.", 404));
    }

    const bidders = auctionItem.bids.sort((a,b) => b.bid - a.bid);

    res.status(200).json({
        success: true,
        auctionItem,
        bidders,
    });
});




export const getMyAuctionItems = catchAsyncErrors(async (req, res, next) => {
    const items = await Auction.find({createdBy: req.user._id});

    res.status(200).json({
        success: true,
        items,
    });
});


export const removeFromAuction = catchAsyncErrors(async (req, res, next) => {
    const {id} = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return next(new ErrorHandler("Invalid ID Format .", 400));
    }
    const auctionItem = await Auction.findById(id);

    if(!auctionItem){
        return next(new ErrorHandler("Auction item not found.", 404));
    }

    await auctionItem.deleteOne();

    res.status(200).json({
        success: true,
        message: "Auction item deleted succesfully.",
    });
});


export const republishItem = catchAsyncErrors(async (req, res, next) => {
    const {id} = req.params;
    
    if(!mongoose.Types.ObjectId.isValid(id)){
        return next(new ErrorHandler("Invalid ID Format .", 400));
    }

    let auctionItem = await Auction.findById(id);

    if(!auctionItem){
        return next(new ErrorHandler("Auction item not found.", 404));
    }

    if(!req.body.startTime ||!req.body.endTime){
        return next(new ErrorHandler
             ("starttime and endtime for republish is mandatory.", 400)); 
     }

    if(new Date(auctionItem.endTime)  >  Date.now()){
        return next(new ErrorHandler
            ("Auction has already active, cannot republish.", 400));
    }

    let data = {
        startTime : new Date(req.body.startTime),
        endTime : new Date(req.body.endTime),
    };
    if(data.startTime < Date.now()){
        return next(new ErrorHandler
            ("Auction start time should be greater than current time.", 400));
    }

    if(data.startTime >= data.endTime){
        return next(new ErrorHandler
            ("Auction start time should be Less than ending time.", 400));
    }

    if(auctionItem.highestBidder)
    {
        const highestBidder = await User.findById(auctionItem.highestBidder);
        highestBidder.moneySpent -= auctionItem.currentBid;
        highestBidder.auctionsWon -= 1;
        highestBidder.save();
    }

    data.bids = [];
    data.commissionCalculated = false;
    data.currentBid = 0;
    data.highestBidder = null;





    auctionItem = await Auction.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
        userFindAndModify: false,
    });

    await Bid.deleteMany({auctionItem: auctionItem._id});




    const createdBy = await User.findByIdAndUpdate(req.user._id, {unpaidCommission : 0}, 
        {new : true,
        runValidators: true,
        userFindAndModify: false,}
    )
    

     res.status(200).json({
         success: true,
         auctionItem,
         message: `Auction item republished succesfully and  will be active on ${req.body.startTime}.`,
         createdBy
     });
        

     

});

