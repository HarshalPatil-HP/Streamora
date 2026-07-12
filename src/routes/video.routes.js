import { Router } from "express"
import {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
} from "../controllers/video.controller.js"
import { authmiddleware } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"

const router = Router()

router.route("/").get(getAllVideos)

router.route("/").post(
    authmiddleware,
    upload.fields([
        { name: "videoFile", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 }
    ]),
    publishAVideo
)

router.route("/:videoId").get(getVideoById)
router.route("/:videoId").delete(authmiddleware, deleteVideo)
router.route("/:videoId").patch(
    authmiddleware,
    upload.single("thumbnail"),
    updateVideo
)
router.route("/toggle/publish/:videoId").patch(authmiddleware, togglePublishStatus)

export default router
