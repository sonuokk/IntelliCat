// import nodemailer from 'nodemailer';

// export const sendEmail = async({email, subject,message})=>{
//     const transporter = nodemailer.createTransport({
//         host: process.env.SMTP_HOST,
//         service: process.env.SMTP_SERVICE,
//         port: process.env.SMTP_PORT,
//         auth: {
//             user: process.env.SMTP_MAIL,
//             pass: process.env.SMTP_PASSWORD,
//         },
//     });
//     const mailOptions = {
//         from: process.env.SMTP_MAIL,
//         to: email,
//         subject,
//         html: message
//     }
//     await transporter.sendMail(mailOptions);
    
// };
import nodemailer from "nodemailer";

export const sendEmail = async ({ email, subject, message }) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: false, // Use TLS for port 587
        auth: {
            user: process.env.SMTP_MAIL,
            pass: process.env.SMTP_PASSWORD,
        },
        // logger: true, // Enable logging
        // debug: true, // Show debug output
    });

    const mailOptions = {
        from: `"LMS" <${process.env.SMTP_MAIL}>`,
        to: email,
        subject,
        html: message,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully to:", email);
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};