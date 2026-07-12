import { Router } from "express"
import {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
} from "../controllers/subscription.controller.js"
import { authmiddleware } from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/c/:channelId").post(authmiddleware, toggleSubscription)
router.route("/u/:channelId").get(getUserChannelSubscribers)
router.route("/c/:subscriberId").get(getSubscribedChannels)

export default router
