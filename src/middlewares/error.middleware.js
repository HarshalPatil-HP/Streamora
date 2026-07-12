import { apireject } from "../utils/Apireject.js"

const errorHandler = (err, req, res, next) => {
    const statuscode = err.statuscode || 500
    const message = err.message || "Internal server error"

    return res.status(statuscode).json({
        success: false,
        message,
        errors: err.errors || [],
        data: null
    })
}

export { errorHandler }
