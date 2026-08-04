import rateLimit from "express-rate-limit"

// ── Strict limiter for auth endpoints (login, signup, password change) ──
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,                   // 20 attempts per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many login/auth attempts. Please try again after 15 minutes.",
        data: null
    }
})

// ── Stricter limiter for signup (prevent mass account creation) ──
export const signupLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,                    // 5 signups per hour per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many accounts created from this IP. Please try again after an hour.",
        data: null
    }
})

// ── General API limiter (prevent abuse/scraping) ──
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000,                  // 1000 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests overall. Please slow down.",
        data: null
    }
})
