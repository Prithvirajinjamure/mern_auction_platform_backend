import { User } from "../models/userSchema.js"
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js"  // Fixed import path
import ErrorHandler from "../middlewares/error.js";

export const trackCommissionStatus = catchAsyncErrors(async (req, res, next) => {
    const user  = await User.findById(req.user._id);

    if(user.unpaidCommission > 0)
    {
        return next(new ErrorHandler
            ("You have unpaid commissions. plz pay them before posting new auction", 403));
    }
    next();
});