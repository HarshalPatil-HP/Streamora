import mongoose, { isValidObjectId } from "mongoose"
import { Comment } from "../models/comment.models.js"
import { Video } from "../models/video.models.js"
import { apireject } from "../utils/Apireject.js"
import { Apiresolve } from "../utils/Apiresolved.js"
import { asynchandler } from "../utils/asynchandler.js"

const getVideoComments = asynchandler(async (req, res) => {
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!isValidObjectId(videoId)) {
        throw new apireject(400, "Invalid video id")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new apireject(404, "Video not found")
    }

    const commentAggregate = Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            fullname: 1,
                            uname: 1,
                            avtar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: { $first: "$owner" }
            }
        }
    ])

    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    }

    const comments = await Comment.aggregatePaginate(commentAggregate, options)

    return res
        .status(200)
        .json(new Apiresolve(200, comments, "Comments fetched successfully"))
})

const addComment = asynchandler(async (req, res) => {
    const { videoId } = req.params
    const { contend } = req.body

    if (!isValidObjectId(videoId)) {
        throw new apireject(400, "Invalid video id")
    }

    if (!contend?.trim()) {
        throw new apireject(400, "Comment content is required")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new apireject(404, "Video not found")
    }

    const comment = await Comment.create({
        contend,
        video: videoId,
        owner: req.user._id
    })

    const createdComment = await Comment.findById(comment._id)

    return res
        .status(201)
        .json(new Apiresolve(201, createdComment, "Comment added successfully"))
})

const updateComment = asynchandler(async (req, res) => {
    const { commentId } = req.params
    const { contend } = req.body

    if (!isValidObjectId(commentId)) {
        throw new apireject(400, "Invalid comment id")
    }

    if (!contend?.trim()) {
        throw new apireject(400, "Comment content is required")
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new apireject(404, "Comment not found")
    }

    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new apireject(403, "You are not allowed to update this comment")
    }

    comment.contend = contend
    await comment.save()

    return res
        .status(200)
        .json(new Apiresolve(200, comment, "Comment updated successfully"))
})

const deleteComment = asynchandler(async (req, res) => {
    const { commentId } = req.params

    if (!isValidObjectId(commentId)) {
        throw new apireject(400, "Invalid comment id")
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new apireject(404, "Comment not found")
    }

    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new apireject(403, "You are not allowed to delete this comment")
    }

    await Comment.findByIdAndDelete(commentId)

    return res
        .status(200)
        .json(new Apiresolve(200, {}, "Comment deleted successfully"))
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}
