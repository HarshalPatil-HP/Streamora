import { Router } from "express"
import {
    getChannelStats,
    getChannelVideos
} from "../controllers/dashboard.controller.js"
import { authmiddleware } from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/stats").get(authmiddleware, getChannelStats)
router.route("/videos").get(authmiddleware, getChannelVideos)

export default router
