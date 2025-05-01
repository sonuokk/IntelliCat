import Errorhandler from "../middlewares/errorMW.js";
import { User } from "../models/user.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendVerificationCode } from "../utils/verificationCode.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import { sendToken } from "../utils/sendToken.js";
import { sendEmail } from "../utils/sendEmail.js";
// import {getResetPasswordToken} from "../models/user.js"
import { generateForgetPasswordEmailTemplate } from "../utils/emailTemplate.js";

//TO register tohe user

export const register = catchAsyncErrors(async (req, res, next) => {
    console.log("BODY:", req.body);
    if (!req.body) {
        return next(new Errorhandler("Request body is missing!", 400));
    }
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return next(new Errorhandler("Please enter all fields!", 400));
    }
    const isRegistered = await User.findOne({ email, accountVerified: true });
    if (isRegistered) {
        return next(new Errorhandler("User already exists!", 400));
    }
    const registerationAttemptsByUser = await User.find({
        email,
        accountVerified: false,
    });
    if (registerationAttemptsByUser.length >= 5) {
        return next(
            new Errorhandler(
                "You've exceeded the number of registration attempts, Contact Support!",
                400
            )
        );
    }
    if (password.length < 8 || password.length > 16) {
        return next(new Errorhandler("Password must be in given criteria!(8 to 16 character long)", 400));
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
    });
    const verificationCode = await user.generateVerificationCode();
    await user.save();
    sendVerificationCode(verificationCode, email, res);
});


//to verify the user
export const verifyOTP = catchAsyncErrors(async (req, res, next) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return next(new Errorhandler("Email or Otp is missing!", 400));
    }
    const userAllEnteries = await User.find({
        email,
        accountVerified: false,
    }).sort({ createdAt: -1 });

    if (!userAllEnteries) {
        return next(new Errorhandler("User not found!", 404));
    }
    let user;
    if (userAllEnteries.length > 1) {
        user = userAllEnteries[0];
        await User.deleteMany({
            _id: { $ne: user._id },
            email,
            accountVerified: false,
        });
    } else {
        user = userAllEnteries[0];
    }

    if (user.verificationCode !== Number(otp)) {
        return next(new Errorhandler("Inavalid OTP", 404))
    }
    const currentTime = Date.now();
    const verificationCodeExpire = new Date(
        user.verificationCodeExpire)
        .getTime();

    if (currentTime > verificationCodeExpire) {
        return next(new Errorhandler("OTP Expired!", 400));
    }

    user.accountVerified = true;
    user.verificationCode = true;
    user.verificationCodeExpire = null;
    await user.save({ validateModifiedOnly: true });

    sendToken(user, 200, "Account Verified! ", res);


});


//To login the user successfully
export const login = catchAsyncErrors(async (req, res, next) => {
    if (!req.body) {
        return next(new Errorhandler("Request body is missing!", 400));
    }
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new Errorhandler("Please enter all fields!", 400));
    }
    const user = await User.findOne({ email, accountVerified: true }).select("+password")
    if (!user) {
        return next(new Errorhandler("User not found!", 400));
    }
    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {

        return next(new Errorhandler("Please give the right password!", 400));
    }
    sendToken(user, 200, "User login successfully.", res);
});

//to logout the user
export const logout = catchAsyncErrors(async (req, res, next) => {
    res.status(200).cookie("token", "", {
        expires: new Date(Date.now()),
        httpOnly: true,
    })
        .json({
            success: true,
            message: "Logout successfully!",
        });
});

//to get user
export const getUser = catchAsyncErrors(async (req, res, next) => {
    const user = req.user;
    res.status(200).json({
        success: true,
        user,
    })
});

//to forget the password
// export const forgetPassword = catchAsyncErrors(async (req, res, next) => {
//     // console.log("Forget password route hit");
//     if (!req.body.email) {
//         return next(new Errorhandler("Email is required", 400))
//     }
//     const user = await User.findOne({
//         email: req.body.email,
//         accountVerified: true,
//     })
//     if (!user) {
//         return next(new Errorhandler("Invalid email", 404));
//     }
//     const resetToken = user.getResetPasswordToken();


//     await user.save({ validateBeforeSave: false });


//     const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

//     const message = generateForgetPasswordEmailTemplate(resetPasswordUrl);

//     // console.log("working till here");
//     // console.log(user.email);
//     // console.log(user.message);



//     try {
//         await sendEmail({
//             email: user.email,
//             subject: "Library Management System passsword recovery",
//             message,
//         });
//         res.status(200)
//             .json({
//                 success: true,
//                 message: `Email sent to ${user.email} successfully`
//             });
//     } catch (error) {
//         user.resetPasswordToken = undefined;
//         user.resetPasswordExpire = undefined;

//         await user.save({ validateBeforeSave: false });
//         return next(new Errorhandler(error.message, 500));
//     }


// });

export const forgetPassword = catchAsyncErrors(async (req, res, next) => {
    // Validate request body
    if (!req.body?.email) {
        return next(new Errorhandler("Email is required", 400));
    }

    // Find user
    const user = await User.findOne({
        email: req.body.email,
        accountVerified: true,
    });
    if (!user) {
        return next(new Errorhandler("Invalid email or account not verified", 404));
    }

    // Generate reset token and save
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Generate reset URL and email message
    const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
    const message = generateForgetPasswordEmailTemplate(resetPasswordUrl);

    try {
        // Send email
        await sendEmail({
            email: user.email,
            subject: "Library Management System password recovery",
            message,
        });

        // Send response
        if (!res) {
            throw new Errorhandler("Response object is invalid", 500);
        }
        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully`,
        });
    } catch (error) {
        // Handle errors without modifying user (to avoid undefined access)
        return next(new Errorhandler(error.message || "Failed to send email", 500));
    }
});

//to reset the password
// export const resetPassword = catchAsyncErrors(async (req, res, next) => {
//     const { token } = req.params;
//     const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
//     const user = await User.findOne({
//         resetPasswordToken,
//         resetPasswordExpire: { $gt: Date.now() },

//     });

//     if (!user) {
//         return next(new Errorhandler("Reset password token is invalid or expired! ", 400));
//     }
//     if (req.body.password !== req.body.confirmPassword) {
//         return next(new Errorhandler("Password didn't match! ", 400));

//     }
//     if (
//         req.body.password < 8 ||
//         req.body.password > 16 ||
//         req.body.confirmPassword < 8 ||
//         req.body.confirmPassword > 16
//     ) {
//         return next(new Errorhandler("Password must be between 8-16 characters! ", 400));

//     }
//     const hashedPassword = await bcrypt.hash(req.body.password, 10);
//     user.password = hashedPassword;
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpire = undefined;

//     await user.save();
//     sendToken(user, 200, "Password reset successfully!", res)
// });

export const resetPassword = catchAsyncErrors(async (req, res, next) => {
    const { token } = req.params;
    const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        return next(new Errorhandler("Reset password token is invalid or expired! ", 400));
    }

    // Validate required fields
    const { password, confirmPassword } = req.body;
    if (!password || !confirmPassword) {
        return next(new Errorhandler("Password and confirmPassword are required!", 400));
    }
    if (password !== confirmPassword) {
        return next(new Errorhandler("Passwords do not match!", 400));
    }
    if (
        password.length < 8 ||
        password.length > 16 ||
        confirmPassword.length < 8 ||
        confirmPassword.length > 16
    ) {
        return next(new Errorhandler("Password must be between 8-16 characters!", 400));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    sendToken(user, 200, "Password reset successfully!", res);
});


//to update password
export const updatePassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user._id).select("+password");
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    if (!currentPassword || !newPassword || !confirmNewPassword) {
        return next(new Errorhandler("Please enter all fields!", 400));
    }
    const isPasswordMatched = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordMatched) {
        return next(new Errorhandler("Current password is incorrect!", 400));

    }
    if (
        newPassword.length < 8 ||
        newPassword.length > 16 ||
        confirmNewPassword.length < 8 ||
        confirmNewPassword.length > 16) {
        return next(new Errorhandler("Password must be betweem 8 - 16 characters", 400));
        
    }
    if(newPassword!==confirmNewPassword){
        return next(new Errorhandler("Confirm password didn't match!", 400));

    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    res.status(200).json({
        success: true,
        message: "Password changed!",
    });
});
