import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import { User } from "../models/user.js";
import Errorhandler from "../middlewares/errorMW.js";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";



export const getAllUsers = catchAsyncErrors(async (req, res, next) => {
    const users = await User.find({ accountVerified: true });
    res.status(200).json({
        success: true,
        users,
    });
});


export const registerNewAdmin = catchAsyncErrors(async (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return next(new Errorhandler("Admin avatar is required!", 400));
    }
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return next(new Errorhandler("Please fill all fields!", 400));
    }

    const isRegistered = await User.findOne({ email, accountVerified: true });

    if (isRegistered) {
        return next(new Errorhandler("User already registered!", 400));

    }
    if (password.length < 8 || password.length > 16) {
        return next(new Errorhandler("Password must be between 8 -  16 characters", 400));

    }
    const { avatar } = req.files;
    const allowedFormats = ["image/png", "image/jpeg", "image.webp", "image/heic"];
    if (!allowedFormats.includes(avatar.mimetype)) {
        return next(new Errorhandler("File format not supported.", 400));
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const cloudinaryResponse = await cloudinary.uploader.upload(
        avatar.tempFilePath, {

        folder: "LMS_ADMIN_AVATAR",
    }
    );
    if (!cloudinaryResponse || cloudinaryResponse.error) {
        console.error(
            "Cloudinary error: ",
            cloudinaryResponse.error ||
            "Unknown cloudinary error.");
        return next(new Errorhandler("Failed to upload avatar image to cloudinary", 500));
    }
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: "Admin",
        accountVerified: true,
        avatar: {
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url
        }
    });

    res.status(201).json({
        success: true,
        message: "Admin registered successfully",
        user,
    })

});