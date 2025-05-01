import express from "express";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./database/db.js";
import { errorMiddlleware } from "./middlewares/errorMW.js";
import authRouter from "./routes/authRoute.js";
import bookRouter from "./routes/bookRoute.js"
import borrowRouter from "./routes/borrowRoute.js"
import userRouter from "./routes/userRoute.js"
import expressFileupload from "express-fileupload";
import { notifyUsers } from "./services/notifyUsers.js";
import { removeNonVerifiedAccounts } from "./services/removeNonVerified.js";

export const app = express();
config({ path: "./config/config.env" });

// Middlewares
app.use(express.json()); // Parse JSON bodies
app.use((req, res, next) => {
    if (req.body) {
        console.log("Request Method:", req.method);
        console.log("Request URL:", req.url);
        console.log("Request Headers:", req.headers);
        console.log("Request Body:", req.body);
    }
    next();
});
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

app.use(expressFileupload({
    useTempFiles: true,
    tempFileDir: "/tmp/"
}));
app.use(cookieParser());
app.use(cors({
    origin: [process.env.FRONTEND_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/book", bookRouter);
app.use("/api/v1/borrow", borrowRouter);
app.use("/api/v1/user", userRouter);

//notifyuserfortherireturndate
notifyUsers();
removeNonVerifiedAccounts();
// MongoDB Connection
connectDB();

// Error Middleware
app.use(errorMiddlleware);