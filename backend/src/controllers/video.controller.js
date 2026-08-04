import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.models.js"
import { VideoView } from "../models/videoView.models.js"
import { User } from "../models/user.models.js"
import { apireject } from "../utils/Apireject.js"
import { Apiresolve } from "../utils/Apiresolved.js"
import { asynchandler } from "../utils/asynchandler.js"
import { uploadOnCloudinary } from "../utils/claudinary.js"
import crypto from "crypto"

const getAllVideos = asynchandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId, sort } = req.query

    // Convenience sort aliases: ?sort=latest or ?sort=trending
    let resolvedSortBy = sortBy
    let resolvedSortType = sortType
    if (sort === "latest") { resolvedSortBy = "createdAt"; resolvedSortType = "desc" }
    if (sort === "trending") { resolvedSortBy = "views"; resolvedSortType = "desc" }

    const pipeline = [
        {
            $match: {
                isPublished: true
            }
        }
    ]

    if (query) {
        pipeline.push({
            $match: {
                $or: [
                    { title: { $regex: query, $options: "i" } },
                    { discription: { $regex: query, $options: "i" } }
                ]
            }
        })
    }

    if (userId) {
        if (!isValidObjectId(userId)) {
            throw new apireject(400, "Invalid user id")
        }
        pipeline.push({
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        })
    }

    if (resolvedSortBy && resolvedSortType) {
        pipeline.push({
            $sort: {
                [resolvedSortBy]: resolvedSortType === "asc" ? 1 : -1
            }
        })
    } else {
        // Default: newest first
        pipeline.push({ $sort: { createdAt: -1 } })
    }

    // JOIN owner details into every video
    pipeline.push(
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    {
                        $project: {
                            fullname: 1,
                            uname: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                ownerDetails: { $first: "$ownerDetails" }
            }
        }
    )

    const videoAggregate = Video.aggregate(pipeline)

    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    }

    const videos = await Video.aggregatePaginate(videoAggregate, options)

    return res
        .status(200)
        .json(new Apiresolve(200, videos, "Videos fetched successfully"))
})

const publishAVideo = asynchandler(async (req, res) => {
    const { title, description } = req.body

    // Field-level validation — specific errors for each missing field
    if (!title?.trim()) {
        throw new apireject(400, "Title is required")
    }
    if (!description?.trim()) {
        throw new apireject(400, "Description is required")
    }

    const videoLocalPath = req.files?.videoFile?.[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path

    if (!videoLocalPath) {
        throw new apireject(400, "Video file is required. Please select a video to upload.")
    }

    if (!thumbnailLocalPath) {
        throw new apireject(400, "Thumbnail is required. Please select a thumbnail image.")
    }

    const videoFile = await uploadOnCloudinary(videoLocalPath)

    if (!videoFile) {
        throw new apireject(500, "Video upload failed. Please check your file format (MP4, WebM) and try again.")
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if (!thumbnail) {
        throw new apireject(500, "Thumbnail upload failed. Please check your image format (JPG, PNG, WebP) and try again.")
    }

    const video = await Video.create({
        title,
        discription: description,
        videofile: videoFile.url,
        thumbnail: thumbnail.url,
        durationNumber: videoFile.duration || 0,
        owner: req.user._id
    })

    const createdVideo = await Video.findById(video._id)

    if (!createdVideo) {
        throw new apireject(500, "Something went wrong while publishing video")
    }

    return res
        .status(201)

        .json(new Apiresolve(201, createdVideo, "Video published successfully"))
})

const getVideoById = asynchandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new apireject(400, "Invalid video id")
    }

    // Use aggregate to embed ownerDetails
    const results = await Video.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(videoId) } },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [{ $project: { fullname: 1, uname: 1, avatar: 1 } }]
            }
        },
        { $addFields: { ownerDetails: { $first: "$ownerDetails" } } }
    ])

    if (!results?.length) {
        throw new apireject(404, "Video not found")
    }

    const video = results[0]

    // ── View Deduplication (12-hour cooldown) ──────────────
    // Identifier: userId for logged-in, or hash of IP+UA for guests
    const COOLDOWN_MS = 12 * 60 * 60 * 1000 // 12 hours
    let identifier
    if (req.user?._id) {
        identifier = String(req.user._id)
    } else {
        const ip = req.ip || req.connection?.remoteAddress || "unknown"
        const ua = req.headers["user-agent"] || "unknown"
        identifier = crypto.createHash("sha256").update(`${ip}:${ua}`).digest("hex")
    }

    const cutoff = new Date(Date.now() - COOLDOWN_MS)
    const existingView = await VideoView.findOne({
        videoId,
        identifier,
        viewedAt: { $gt: cutoff }
    })

    if (!existingView) {
        // Either first view ever, or cooldown has expired
        await VideoView.findOneAndUpdate(
            { videoId, identifier },
            { viewedAt: new Date() },
            { upsert: true, new: true }
        )
        await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } })
    }
    // ───────────────────────────────────────────────────────

    if (req.user?._id) {
        await User.findByIdAndUpdate(req.user._id, {
            $addToSet: { watchHistory: videoId }
        })
    }

    return res
        .status(200)
        .json(new Apiresolve(200, video, "Video fetched successfully"))
})

const updateVideo = asynchandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body

    if (!isValidObjectId(videoId)) {
        throw new apireject(400, "Invalid video id")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new apireject(404, "Video not found")
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new apireject(403, "You are not allowed to update this video")
    }

    const thumbnailLocalPath = req.file?.path
    let thumbnailUrl

    if (thumbnailLocalPath) {
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
        if (!thumbnail) {
            throw new apireject(400, "Failed to upload thumbnail")
        }
        thumbnailUrl = thumbnail.url
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title: title || video.title,
                discription: description || video.discription,
                ...(thumbnailUrl && { thumbnail: thumbnailUrl })
            }
        },
        { new: true }
    )

    return res
        .status(200)
        .json(new Apiresolve(200, updatedVideo, "Video updated successfully"))
})

const deleteVideo = asynchandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new apireject(400, "Invalid video id")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new apireject(404, "Video not found")
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new apireject(403, "You are not allowed to delete this video")
    }

    await Video.findByIdAndDelete(videoId)

    return res
        .status(200)
        .json(new Apiresolve(200, {}, "Video deleted successfully"))
})

const togglePublishStatus = asynchandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new apireject(400, "Invalid video id")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new apireject(404, "Video not found")
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new apireject(403, "You are not allowed to change publish status")
    }

    video.isPublished = !video.isPublished
    await video.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new Apiresolve(200, video, "Publish status toggled successfully"))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
