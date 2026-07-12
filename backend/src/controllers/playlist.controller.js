import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.models.js"
import { Video } from "../models/video.models.js"
import { apireject } from "../utils/Apireject.js"
import { Apiresolve } from "../utils/Apiresolved.js"
import { asynchandler } from "../utils/asynchandler.js"

const createPlaylist = asynchandler(async (req, res) => {
    const { name, description } = req.body

    if (!name?.trim() || !description?.trim()) {
        throw new apireject(400, "Name and description are required")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id,
        videos: []
    })

    return res
        .status(201)
        .json(new Apiresolve(201, playlist, "Playlist created successfully"))
})

const getUserPlaylists = asynchandler(async (req, res) => {
    const { userId } = req.params

    if (!isValidObjectId(userId)) {
        throw new apireject(400, "Invalid user id")
    }

    const playlists = await Playlist.find({ owner: userId })

    return res
        .status(200)
        .json(new Apiresolve(200, playlists, "User playlists fetched successfully"))
})

const getPlaylistById = asynchandler(async (req, res) => {
    const { playlistId } = req.params

    if (!isValidObjectId(playlistId)) {
        throw new apireject(400, "Invalid playlist id")
    }

    const playlist = await Playlist.findById(playlistId).populate("videos", "title thumbnail videofile views durationNumber")

    if (!playlist) {
        throw new apireject(404, "Playlist not found")
    }

    return res
        .status(200)
        .json(new Apiresolve(200, playlist, "Playlist fetched successfully"))
})

const addVideoToPlaylist = asynchandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new apireject(400, "Invalid playlist or video id")
    }

    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new apireject(404, "Playlist not found")
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new apireject(403, "You are not allowed to modify this playlist")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new apireject(404, "Video not found")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet: {
                videos: videoId
            }
        },
        { new: true }
    )

    return res
        .status(200)
        .json(new Apiresolve(200, updatedPlaylist, "Video added to playlist successfully"))
})

const removeVideoFromPlaylist = asynchandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new apireject(400, "Invalid playlist or video id")
    }

    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new apireject(404, "Playlist not found")
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new apireject(403, "You are not allowed to modify this playlist")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: {
                videos: videoId
            }
        },
        { new: true }
    )

    return res
        .status(200)
        .json(new Apiresolve(200, updatedPlaylist, "Video removed from playlist successfully"))
})

const deletePlaylist = asynchandler(async (req, res) => {
    const { playlistId } = req.params

    if (!isValidObjectId(playlistId)) {
        throw new apireject(400, "Invalid playlist id")
    }

    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new apireject(404, "Playlist not found")
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new apireject(403, "You are not allowed to delete this playlist")
    }

    await Playlist.findByIdAndDelete(playlistId)

    return res
        .status(200)
        .json(new Apiresolve(200, {}, "Playlist deleted successfully"))
})

const updatePlaylist = asynchandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body

    if (!isValidObjectId(playlistId)) {
        throw new apireject(400, "Invalid playlist id")
    }

    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new apireject(404, "Playlist not found")
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new apireject(403, "You are not allowed to update this playlist")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                name: name || playlist.name,
                description: description || playlist.description
            }
        },
        { new: true }
    )

    return res
        .status(200)
        .json(new Apiresolve(200, updatedPlaylist, "Playlist updated successfully"))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
