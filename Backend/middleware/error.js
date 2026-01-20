const fs = require('fs');
const path = require('path');

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log directly to console
    console.error("❌ Error caught by middleware:", err);

    // Log to file for debugging
    try {
        const logPath = path.join(__dirname, '..', 'backend_errors.log');
        const logMessage = `\n[${new Date().toISOString()}] ${err.name}: ${err.message}\nStack: ${err.stack}\n-------------------`;
        fs.appendFileSync(logPath, logMessage);
    } catch (e) {
        console.error("Failed to write to error log:", e);
    }

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = `Resource not found. Invalid: ${err.path}`;
        error = new ErrorResponse(message, 404);
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = new ErrorResponse(message, 400);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = new ErrorResponse(message, 400);
    }

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Server Error'
    });
};

class ErrorResponse extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

module.exports = errorHandler;
