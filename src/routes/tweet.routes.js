import { Router } from "express"
import {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
} from "../controllers/tweet.controller.js"
import { authmiddleware } from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/").post(authmiddleware, createTweet)
router.route("/user/:userId").get(getUserTweets)
router.route("/:tweetId").patch(authmiddleware, updateTweet)
router.route("/:tweetId").delete(authmiddleware, deleteTweet)

export default router
