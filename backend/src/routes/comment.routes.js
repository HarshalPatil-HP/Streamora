import { Router } from "express"
import {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
} from "../controllers/comment.controller.js"
import { authmiddleware, optionalAuth } from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/:videoId").get(optionalAuth, getVideoComments)
router.route("/:videoId").post(authmiddleware, addComment)
router.route("/c/:commentId").patch(authmiddleware, updateComment)
router.route("/c/:commentId").delete(authmiddleware, deleteComment)

export default router
