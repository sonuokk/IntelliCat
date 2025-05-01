import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import { Book } from "../models/book.js";
import { User } from "../models/user.js";
import ErrorHandler from "../middlewares/errorMW.js";

//to add a book
export const addBook = catchAsyncErrors(async (req, res, next) => {
    const { title, author, description, price, quantity } = req.body;
    if (!title || !author || !description || !price || !quantity) {
        return next(new ErrorHandler(`Please fill all fields!`, 400));
    }
    const book = await Book.create({
        title,
        author,
        description,
        price,
        quantity,
    });
    res.status(200).json({
        success: true,
        message: "Book added successfully.",
        book,
    });
});
//to get all books
export const getAllBooks = catchAsyncErrors(async (req, res, next) => {
    const books = await Book.find();
    res.status(201).json({
        success: true,
        books,
    });
});

//to delete a book
export const deleteBook = catchAsyncErrors(async (req, res, next) => {
    const {id} = req.params;
    const book = await Book.findById(id);
    if(!book){
        return next(new ErrorHandler(`Book not found!`, 404));
    }
    await book.deleteOne();
    res.status(201).json({
        success: true,
        message: "Book deleted successfully.",
    });
});
