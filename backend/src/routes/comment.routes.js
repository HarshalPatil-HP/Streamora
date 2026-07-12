import { Router } from "express"
import {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
} from "../controllers/comment.controller.js"
import { authmiddleware } from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/:videoId").get(getVideoComments)
router.route("/:videoId").post(authmiddleware, addComment)
router.route("/c/:commentId").patch(authmiddleware, updateComment)
router.route("/c/:commentId").delete(authmiddleware, deleteComment)

export default router
