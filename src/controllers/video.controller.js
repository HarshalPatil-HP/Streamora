import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.models.js"
import { User } from "../models/user.models.js"
import { apireject } from "../utils/Apireject.js"
import { Apiresolve } from "../utils/Apiresolved.js"
import { asynchandler } from "../utils/asynchandler.js"
import { uploadOnCloudinary } from "../utils/claudinary.js"

const getAllVideos = asynchandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query

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
                title: {
                    $regex: query,
                    $options: "i"
                }
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

    if (sortBy && sortType) {
        pipeline.push({
            $sort: {
                [sortBy]: sortType === "asc" ? 1 : -1
            }
        })
    }

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

    if (!title?.trim() || !description?.trim()) {
        throw new apireject(400, "Title and description are required")
    }

    const videoLocalPath = req.files?.videoFile?.[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path

    if (!videoLocalPath) {
        throw new apireject(400, "Video file is required")
    }

    const videoFile = await uploadOnCloudinary(videoLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if (!videoFile) {
        throw new apireject(400, "Failed to upload video on cloudinary")
    }

    if (!thumbnail) {
        throw new apireject(400, "Failed to upload thumbnail on cloudinary")
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

    const video = await Video.findById(videoId)

    if (!video) {
        throw new apireject(404, "Video not found")
    }

    video.views += 1
    await video.save({ validateBeforeSave: false })

    if (req.user?._id) {
        await User.findByIdAndUpdate(req.user._id, {
            $addToSet: {
                watchHistory: videoId
            }
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
