import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.models.js"
import { Like } from "../models/like.models.js"
import { apireject } from "../utils/Apireject.js"
import { Apiresolve } from "../utils/Apiresolved.js"
import { asynchandler } from "../utils/asynchandler.js"

const createTweet = asynchandler(async (req, res) => {
    const { contend } = req.body

    if (!contend?.trim()) {
        throw new apireject(400, "Tweet content is required")
    }

    if (contend.length > 500) {
        throw new apireject(400, "Tweet is too long (max 500 characters)")
    }

    const tweet = await Tweet.create({
        contend,
        owner: req.user._id
    })

    // Return populated tweet
    const populated = await Tweet.aggregate([
        { $match: { _id: tweet._id } },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [{ $project: { fullname: 1, uname: 1, avatar: 1 } }]
            }
        },
        { $addFields: { owner: { $first: "$owner" }, likeCount: 0, isLikedByCurrentUser: false } }
    ])

    return res
        .status(201)
        .json(new Apiresolve(201, populated[0] || tweet, "Tweet created successfully"))
})

const getUserTweets = asynchandler(async (req, res) => {
    const { userId } = req.params
    const { sort } = req.query

    if (!isValidObjectId(userId)) {
        throw new apireject(400, "Invalid user id")
    }

    const pipeline = [
        { $match: { owner: new mongoose.Types.ObjectId(userId) } },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [{ $project: { fullname: 1, uname: 1, avatar: 1 } }]
            }
        },
        { $addFields: { owner: { $first: "$owner" } } },
        // Like count + current user liked state
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likes"
            }
        },
        {
            $addFields: {
                likeCount: { $size: "$likes" },
                isLikedByCurrentUser: {
                    $in: [
                        req.user?._id ? new mongoose.Types.ObjectId(req.user._id) : null,
                        { $ifNull: ["$likes.likedBy", []] }
                    ]
                }
            }
        },
        { $project: { likes: 0 } }
    ]

    // Apply sorting
    if (sort === "trending") {
        pipeline.push({ $sort: { likeCount: -1, createdAt: -1 } })
    } else {
        // "latest"
        pipeline.push({ $sort: { createdAt: -1 } })
    }

    const tweets = await Tweet.aggregate(pipeline)

    return res
        .status(200)
        .json(new Apiresolve(200, tweets, "User tweets fetched successfully"))
})

const updateTweet = asynchandler(async (req, res) => {
    const { tweetId } = req.params
    const { contend } = req.body

    if (!isValidObjectId(tweetId)) {
        throw new apireject(400, "Invalid tweet id")
    }

    if (!contend?.trim()) {
        throw new apireject(400, "Tweet content is required")
    }

    if (contend.length > 500) {
        throw new apireject(400, "Tweet is too long (max 500 characters)")
    }

    const tweet = await Tweet.findById(tweetId)

    if (!tweet) {
        throw new apireject(404, "Tweet not found")
    }

    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new apireject(403, "You are not allowed to update this tweet")
    }

    tweet.contend = contend
    await tweet.save()

    return res
        .status(200)
        .json(new Apiresolve(200, tweet, "Tweet updated successfully"))
})

const deleteTweet = asynchandler(async (req, res) => {
    const { tweetId } = req.params

    if (!isValidObjectId(tweetId)) {
        throw new apireject(400, "Invalid tweet id")
    }

    const tweet = await Tweet.findById(tweetId)

    if (!tweet) {
        throw new apireject(404, "Tweet not found")
    }

    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new apireject(403, "You are not allowed to delete this tweet")
    }

    await Tweet.findByIdAndDelete(tweetId)
    // Also clean up likes for this tweet
    await Like.deleteMany({ tweet: tweetId })

    return res
        .status(200)
        .json(new Apiresolve(200, {}, "Tweet deleted successfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
