import { Router } from "express"
import {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos,
    getVideoLikeStatus,
    getCommentLikeStatus,
    getTweetLikeStatus
} from "../controllers/like.controller.js"
import { authmiddleware } from "../middlewares/auth.middleware.js"

// Optional auth middleware — attaches user if token present, but doesn't block
import { optionalAuth } from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/videos").get(authmiddleware, getLikedVideos)
router.route("/videos/:videoId").post(authmiddleware, toggleVideoLike)
router.route("/videos/:videoId/status").get(optionalAuth, getVideoLikeStatus)

router.route("/comments/:commentId").post(authmiddleware, toggleCommentLike)
router.route("/comments/:commentId/status").get(optionalAuth, getCommentLikeStatus)

router.route("/tweets/:tweetId").post(authmiddleware, toggleTweetLike)
router.route("/tweets/:tweetId/status").get(optionalAuth, getTweetLikeStatus)

export default router
