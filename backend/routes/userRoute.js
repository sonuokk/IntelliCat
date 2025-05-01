import express from "express";
import {
    getAllUsers,
    registerNewAdmin
} from "../controllers/userController.js";
import {
    isAuthenticated,
    isAuthorized
} from "../middlewares/authMiddleware.js";
import { get } from "mongoose";

const router = express.Router();
router.get("/all", isAuthenticated, isAuthorized("Admin"), getAllUsers);
router.post(
    "/add/new-admin",
    isAuthenticated,
    isAuthorized("Admin"),
    registerNewAdmin,
);

export default router;