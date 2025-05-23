import {User} from "../models/userSchema.js";
import jwt from "jsonwebtoken";
import ErrorHandler from "./error.js";
import { catchAsyncErrors } from "./catchAsyncErrors.js";

export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
    const token = req.cookies.token;

    if(!token)
    {
        return next(new ErrorHandler("user not authenticated", 401));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = await User.findById(decoded.id);
    next();
});

export const isAuthorized = (role) => {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return next(new ErrorHandler(`Role: ${role} is not allowed to access this resource`, 403));
        }
        next();
    };
};
