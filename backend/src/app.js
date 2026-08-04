import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let app = express()

// ── CORS — environment-aware allowlist ──────────────
const allowedOrigins = process.env.NODE_ENV === "production"
    ? [process.env.CORS_ORIGIN].filter(Boolean)
    : ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"]

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true)
        if (allowedOrigins.includes(origin)) {
            return callback(null, true)
        }
        return callback(new Error("Not allowed by CORS"))
    },
    credentials: true
}))

app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))
app.use(express.static(path.join(__dirname, "../public")))
app.use(cookieParser())

import healthcheckrouter from "./routes/health.routes.js"
import userRouter from "./routes/user.routes.js"
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comment.routes.js"
import likeRouter from "./routes/like.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"
import { errorHandler } from "./middlewares/error.middleware.js"
import { handleMulterError } from "./middlewares/multer.middleware.js"
import { apiLimiter } from "./middlewares/rateLimit.middleware.js"

// ── General API rate limiting ──────────────────────
app.use("/api/", apiLimiter)

app.use("/api/v1/healthcheck", healthcheckrouter)
app.use("/api/v1/user", userRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/playlists", playlistRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/dashboard", dashboardRouter)

app.use(handleMulterError)
app.use(errorHandler)

export { app }
