import { catchAsyncErrors } from "./catchAsyncError.js"
import ErrorHandler from "./errorMW.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.js"

export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
    const { token } = req.cookies;
    if (!token) {
        return next(new ErrorHandler("User is not authenticated!", 400));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    // console.log(decoded);
    req.user = await User.findById(decoded.id);
    next();

});


export const isAuthorized = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)){
            return next(new ErrorHandler(`User with role (${req.user.role}) isn't allowed to access this resource!`, 400))
        }
        next();
    }
}