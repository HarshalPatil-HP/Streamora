import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.models.js"
import { apireject } from "../utils/Apireject.js"
import { Apiresolve } from "../utils/Apiresolved.js"
import { asynchandler } from "../utils/asynchandler.js"

const createTweet = asynchandler(async (req, res) => {
    const { contend } = req.body

    if (!contend?.trim()) {
        throw new apireject(400, "Tweet content is required")
    }

    const tweet = await Tweet.create({
        contend,
        owner: req.user._id
    })

    return res
        .status(201)
        .json(new Apiresolve(201, tweet, "Tweet created successfully"))
})

const getUserTweets = asynchandler(async (req, res) => {
    const { userId } = req.params

    if (!isValidObjectId(userId)) {
        throw new apireject(400, "Invalid user id")
    }

    const tweets = await Tweet.find({ owner: userId }).sort({ createdAt: -1 })

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
