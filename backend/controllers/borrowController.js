import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import Errorhandler from "../middlewares/errorMW.js";
import { Book } from "../models/book.js";
import { Borrow } from "../models/borrow.js"
import { User } from "../models/user.js";
import { calculateFine } from "../utils/fineCalc.js";
//to record borrowed books
export const recordBorrowedBooks = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const { email } = req.body;

    const book = await Book.findById(id);
    if (!book) {
        return next(new Errorhandler("Book not found!", 404))
    }
    const user = await User.findOne({ email, accountVerified: true });
    if (!user) {
        return next(new Errorhandler("User not found!", 404))
    }
    if (book.quantity === 0) {
        return next(new Errorhandler("Book not available!", 404))
    }
    const isAlreadyBorrowed = user.borrowedBooks.find(
        (b) => b.bookId.toString() === id && b.returned === false

    );
    if (isAlreadyBorrowed) {
        return next(new Errorhandler("Book already borrowed!", 400))
    }
    book.quantity -= 1;
    book.availability = book.quantity > 0;
    await book.save();




    //add book to boorwedbookarray

    user.borrowedBooks.push({
        bookId: book._id,
        bookTitle: book.title,
        borrowedDate: new Date(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    await user.save();
    await Borrow.create({
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
        },
        book: book._id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        price: book.price,
    });
    res.status(200).json({
        success: true,
        message: "Borrowed book recorded successfully",
    });
});
//to check total returned books
export const returnBorrowedBooks = catchAsyncErrors(async (req, res, next) => {
    const { bookId } = req.params;
    const { email } = req.body;
    const book = await Book.findById(bookId);

    if (!book) {
        return next(new Errorhandler("Book not found!", 404))
    }
    const user = await User.findOne({ email, accountVerified: true });
    if (!user) {
        return next(new Errorhandler("User not found!", 404))
    }
    const borrowedBook = user.borrowedBooks.find(
        (b) => b.bookId.toString() === bookId && b.returned === false
    );
    if (!borrowedBook) {
        return next(new Errorhandler("You havn't borrowed this book yet.", 400))
    }
    borrowedBook.returned = true;
    await user.save();
    book.quantity += 1;
    book.availability = book.quantity > 0;
    await book.save();

    const borrow = await Borrow.findOne({

        book: bookId,
        "user.email": email,
        returnDate: null,
    });
    if (!borrow) {
        return next(new Errorhandler("You havn't borrowed this book yet.", 400))

    }
    borrow.returnDate = new Date();
    const fine = calculateFine(borrow.dueDate);
    borrow.fine = fine;
    await borrow.save();

    res.status(200).json({
        success: true,
        message: fine !== 0
            ? `Book has been returned successfully. The total charges including fines are $${fine + book.price}`
            : `Book has been returned successfully. The total charges are $${book.price}`,
    });

});
//to check total borrowed books ( from user side)
export const borrowedBooks = catchAsyncErrors(async (req, res, next) => {
    const { borrowedBooks } = req.user;
    res.status(200).json({
        success: true,
        borrowedBooks,
    });
});


export const getBorrowBooksForAdmin = catchAsyncErrors(async (req, res, next) => {
    const borrowedBooks= await Borrow.find();
    res.status(200).json({
        success: true,
        borrowedBooks,
    });
});




