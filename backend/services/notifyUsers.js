//cron is basically used for scheduling in simple words!
import cron from "node-cron";
import { User } from "../models/user.js";
import { Borrow } from "../models/borrow.js"
import { sendEmail } from "../utils/sendEmail.js"





export const notifyUsers = () => {
  // cron.schedule("*/30 * * * *", async () => {
  cron.schedule("*/10 * * * * *", async () => {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const borrowers = await Borrow.find({
        dueDate: {
          $lt: oneDayAgo
        },
        returnDate: null,
        notified: false,
      });

      for (const element of borrowers) {
        if (element.user && element.user.email) {
          // const user = await User.findById(element.user.id);
          const emailTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Book Return Reminder</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      background: linear-gradient(135deg, #e0f7fa, #b2ebf2);
      margin: 0;
      padding: 20px;
      color: #333;
    }
    .container {
      max-width: 500px;
      margin: 0 auto;
      background: linear-gradient(135deg, #ffffff, #e3f2fd);
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      overflow: hidden;
    }
    .content {
      padding: 25px;
      font-size: 14px;
      line-height: 1.6;
    }
    .highlight {
      font-weight: bold;
      color: #c62828;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background: linear-gradient(135deg, #0288d1, #0277bd);
      color: #fff;
      text-decoration: none;
      border-radius: 6px;
      font-size: 14px;
      text-align: center;
      margin: 20px 0;
      transition: transform 0.2s;
    }
    .button:hover {
      transform: scale(1.05);
    }
    .footer {
      background: linear-gradient(135deg, #e0f7fa, #b2ebf2);
      padding: 12px;
      text-align: center;
      font-size: 12px;
      color: #455a64;
    }
    .footer a {
      color: #01579b;
      text-decoration: none;
    }
    .footer a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <p>Dear ${element.user.name},</p>
      <p>Your borrowed book is <span class="highlight">due today</span>.</p>
      <p>Please return it to the library soon to avoid late fees.</p>
      <a href="mailto:library@example.com" class="button">Contact Library</a>
      <p>Best regards,<br>Library Management System</p>
    </div>
    <div class="footer">
      <p>© 2025 Library Management System</p>
      <p><a href="mailto:library@example.com">library@example.com</a></p>
    </div>
  </div>
</body>
</html>`;
          sendEmail({
            email: element.user.email,
            subject: "Book return reminder!!!!!",
            // message: `Hello 
            // ${element.user.name},\n\n
            // This is a gentle reminder that the book you borrowed is due for retur today. 
            // Please return it to the library as soon as possible.\n\n
            // Thank-you!`
            message: emailTemplate,
          });
          element.notified = true;
          await element.save();
          // console.log(`Email sent to ${element.user.email}`);

        }
      }
    } catch (error) {
      console.error("Some error occured while notifying users", error);
    }

  })
}