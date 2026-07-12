import { Router } from "express"
import {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
} from "../controllers/like.controller.js"
import { authmiddleware } from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/videos").get(authmiddleware, getLikedVideos)
router.route("/videos/:videoId").post(authmiddleware, toggleVideoLike)
router.route("/comments/:commentId").post(authmiddleware, toggleCommentLike)
router.route("/tweets/:tweetId").post(authmiddleware, toggleTweetLike)

export default router
