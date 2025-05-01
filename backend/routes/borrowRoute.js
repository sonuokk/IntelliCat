import express from "express";
import {
    borrowedBooks,
    getBorrowBooksForAdmin,
    recordBorrowedBooks,
    returnBorrowedBooks,
} from "../controllers/borrowController.js";
import {
    isAuthenticated,
    isAuthorized,
} from "../middlewares/authMiddleware.js";


const router = express.Router();

router.post("/record-borrowed-book/:id", isAuthenticated, isAuthorized("Admin"), recordBorrowedBooks);
router.put("/returned-book/:bookId",isAuthenticated, isAuthorized("Admin"), returnBorrowedBooks);
router.get("/my-borrowed-books",isAuthenticated, borrowedBooks);
router.get("/borrowed-books-by-users",isAuthenticated, isAuthorized("Admin"), getBorrowBooksForAdmin);


export default router;