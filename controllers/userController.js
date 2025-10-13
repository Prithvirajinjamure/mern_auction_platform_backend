import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/userSchema.js";
import { v2 as cloudinary } from "cloudinary";
import { generateToken } from "../utils/jwtToken.js";




export const register = catchAsyncErrors(async(req, res, next) =>
{
    if (!req.files || Object.keys(req.files).length === 0) {
        return next(new ErrorHandler("Profile Image required.", 400));
    }

    const { profileImage } = req.files;

    const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedFormats.includes(profileImage.mimetype)) {
        return next(new ErrorHandler("file format not supported", 400));
    }

    const { 
        userName,
        email,
        password,
        phone,
        address,
        role,
        bankAccountNumber,
        bankAccountName,
        bankName,
        easypaisaAccountNumber,
        paypalEmail,

    } = req.body;

    if (!userName || !email || !phone || !password || !address || !role) {
        return next(new ErrorHandler("please fill full form.", 400));

    }

    if (role === "Auctioneer") {
        if (!bankAccountName || !bankAccountNumber || !bankName) {
            return next(new ErrorHandler("please provide full bank details.", 400));

        }


        if (!easypaisaAccountNumber) {
            return next(new ErrorHandler("please provide your easypaisa account number.", 400));

        }


        if (!paypalEmail) {
            return next(new ErrorHandler("please provide your paypal email.", 400));

        }
    }


    const isRegistered = await User.findOne({email});

    if (isRegistered) {
        return next(new ErrorHandler("user alredy registered", 400));
    }


    const cloudinaryRespones = await cloudinary.uploader.upload(
        profileImage.tempFilePath,
        {
            folder: "MERN_AUCTION_PLATFORM_USERS",
        }
    );

    if (!cloudinaryRespones || cloudinaryRespones.error) {
        console.error("Cloudinary error:",
            cloudinaryRespones.error || "Unknown cloudinary error"
        );

        return next(new ErrorHandler("Failed to upload profile image to cloudinary.", 500)
        );


    }

    const user = await User.create
    ({
        userName,
        email,
        password,
        phone,
        address,
        role,
        profileImage:{
            public_id : cloudinaryRespones.public_id,
            url : cloudinaryRespones.secure_url,
        },


       
        
            paymentMethods:
            {
                bankTransfer: {
                    bankAccountNumber,
                    bankAccountName,
                    bankName,
                },

                easypaisa: {
                    easypaisaAccountNumber,
                },

                paypal: {
                    paypalEmail,
                },
            },
        });
    
    
      generateToken(user,"user Registered.", 201, res);
    });
        



export const login = catchAsyncErrors(async(req, res, next) =>
{
    const {email, password} = req.body;
    if(!email || !password)
    {
        return next(new ErrorHandler("please fill full form",400));
    }
    const user = await User.findOne({email}).select("+password");

    if (!user) {
        return next(new ErrorHandler("Invalid credential", 400));
    }
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
        return next(new ErrorHandler("Invalid credential", 400)); 
    }
    generateToken(user,"user login successfully", 200, res);
}
);








export const getProfile = catchAsyncErrors(async(req, res, next) =>
{
    const user = req.user;
    res.status(200).json({
        success: true,
        user, 
    });
}   
);




export const logout = catchAsyncErrors(async(req, res, next) =>
{
        res.status(200).cookie("token", "", {
            expires : new Date(Date.now()) ,
            httpOnly: true,
        }).json({
            success: true,
            message: "user logout successfully",
        });
            
});

export const fetchLeaderboard = catchAsyncErrors(async(req, res, next) =>
{
    const users = await User.find({moneySpent : {$gt : 0}});
  const leaderboard = users.sort((a,b) => (b.moneySpent - a.moneySpent));
  res.status(200).json({
    success: true,
    leaderboard,
  });
});
            

 

    
