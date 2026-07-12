import { Router } from "express"
import {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
} from "../controllers/playlist.controller.js"
import { authmiddleware } from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/").post(authmiddleware, createPlaylist)
router.route("/user/:userId").get(getUserPlaylists)
router.route("/:playlistId").get(getPlaylistById)
router.route("/add/:videoId/:playlistId").patch(authmiddleware, addVideoToPlaylist)
router.route("/remove/:videoId/:playlistId").patch(authmiddleware, removeVideoFromPlaylist)
router.route("/:playlistId").delete(authmiddleware, deletePlaylist)
router.route("/:playlistId").patch(authmiddleware, updatePlaylist)

export default router
