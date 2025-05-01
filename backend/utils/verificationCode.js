// import { generateVerificationOtpEmailTemplate } from "./emailTemplate.js";
// import { sendEmail } from "./sendEmail.js";

// export async function sendVerificationCode(verificationCode, email, res) {
//     try {
//         const message = generateVerificationOtpEmailTemplate(verificationCode);
//         sendEmail({
//             email,
//             subject: "Verification Code (LMS)",
//             message,
//         });
//         res.status(200).json({
//             success: true,
//             message: "Verification code sent successfully.",
//         })
//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: "Verification code failed to send",
//         });
//     }
// }

import { generateVerificationOtpEmailTemplate } from "./emailTemplate.js";
import { sendEmail } from "./sendEmail.js";

export async function sendVerificationCode(verificationCode, email, res) {
    try {
        const message = generateVerificationOtpEmailTemplate(verificationCode);
        await sendEmail({
            email,
            subject: "Verification Code (LMS)",
            message,
        });
        res.status(200).json({
            success: true,
            message: "Verification code sent successfully.",
        });
    } catch (error) {
        console.error("Error in sendVerificationCode:", error);
        res.status(500).json({
            success: false,
            message: "Verification code failed to send",
        });
    }
}