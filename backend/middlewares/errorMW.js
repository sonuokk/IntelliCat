class ErrorHandler extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}
export const login = (req, res, next) => {

}
export const errorMiddlleware = (err, req, res, next) => {
    err.message = err.message || "Internal Server Error";
    // const message = err.message || "Internal Server Error";

    // const statusCode = err.statusCode || 500;
    err.statusCode = err.statusCode || 500;
    console.log(err);

    if (err.code === 11000) {
        const statusCode = 400;
        const message = `Duplicate field value entered!`;
        err = new ErrorHandler(message, statusCode);
    }
    if (err.name === "JsonWebTokenErr") {
        const statusCode = 400;
        const message = `Invalid Json Web Token, Try again!`;
        err = new ErrorHandler(message, statusCode);

    }
    if (err.name === "TokenExpiredError") {
        const statusCode = 400;
        const message = `Json Web Token Expired!, Try again!`;
        err = new ErrorHandler(message, statusCode);
    }
    if (err.name === "CastErro") {
        const statusCode = 400;
        const message = `Resource not found. Invalid ${err.path}`;
        err = new ErrorHandler(message, statusCode);
    }
    const errorMesasge = err.errors
        ? Object.values(err.erros)
            .map(error => error.message)
            .join(" ")
        : err.message;


    return res.status(err.statusCode).json({
        success: false,
        message: errorMesasge,
    })
};

export default ErrorHandler;