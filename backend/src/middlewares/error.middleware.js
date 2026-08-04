import { apireject } from "../utils/Apireject.js"

const errorHandler = (err, req, res, next) => {
    let statuscode = err.statuscode || 500
    let message = err.message || "Internal server error"

    // Sanitize non-operational (unhandled) errors in production
    if (process.env.NODE_ENV === "production" && !err.statuscode) {
        message = "Something went wrong. Please try again later."
    }

    // Always log the real error server-side for debugging
    if (process.env.NODE_ENV !== "production" || !err.statuscode) {
        console.error("[Error Handler]", err)
    }

    return res.status(statuscode).json({
        success: false,
        message,
        errors: err.errors || [],
        // Expose stack only in development
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
        data: null
    })
}

export { errorHandler }
