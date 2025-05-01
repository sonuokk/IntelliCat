export const generateVerificationOtpEmailTemplate = (otpcode) => {
    return `
    
        <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="padding: 40px 30px; text-align: center;">
                <h1 style="color: #333333; font-size: 24px; margin: 0 0 20px;">Verify Your Email Address</h1>
                <p style="color: #666666; font-size: 16px; line-height: 1.5; margin: 0 0 20px;">
                    Thank you for signing up! Please use the following One-Time Password (OTP) to verify your email address.
                </p>
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
                    <span style="font-size: 28px; font-weight: bold; color: #007bff; letter-spacing: 2px;">${otpcode}</span>
                </div>
                <p style="color: #666666; font-size: 14px; line-height: 1.5; margin: 0 0 20px;">
                    This OTP is valid for 15 minutes. Please do not share it with anyone.
                </p>
                <p style="color: #666666; font-size: 14px; line-height: 1.5; margin: 0;">
                    If you did not request this, please ignore this email or contact our support team.
                </p>
            </div>
            <div style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                <p style="color: #999999; font-size: 12px; margin: 0;">
                    © 2025 Your Company. All rights reserved.
                </p>
            </div>
        </div>
    
    `;
};

export function generateForgetPasswordEmailTemplate(resetPasswordUrl){
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <tr>
            <td style="padding: 40px 30px; text-align: center;">
                <h1 style="color: #333333; font-size: 24px; margin: 0 0 20px;">Reset Your Password</h1>
                <p style="color: #666666; font-size: 16px; line-height: 1.5; margin: 0 0 20px;">
                    We received a request to reset your password. Click the button below to set a new password.
                </p>
                <a href="${resetPasswordUrl}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 6px; margin: 20px 0;">Reset Password</a>
                <p style="color: #666666; font-size: 14px; line-height: 1.5; margin: 0 0 20px;">
                    This link is valid for 24 hours. If you did not request a password reset, please ignore this email or contact our support team.
                </p>
                <p style="color: #666666; font-size: 14px; line-height: 1.5; margin: 0;">
                    For security reasons, do not share this link with anyone.
                </p>
            </td>
        </tr>
        <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                <p style="color: #999999; font-size: 12px; margin: 0;">
                    © 2025 Your Company. All rights reserved.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
`}