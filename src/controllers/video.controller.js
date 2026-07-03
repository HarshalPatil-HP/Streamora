import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {apireject} from "../utils/Apireject.js"
import {Apiresolve} from "../utils/Apiresolved.js"
import {asynchandler} from "../utils/asynchandler.js"
import {uploadOnCloudinary} from "../utils/claudinary.js"


const getAllVideos = asynchandler(async (req, res) => {

    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
const pipeline = [];

if (query) {
    pipeline.push({
        $match: {
            title: {
                $regex: query,
                $options: "i"
            }
        }
    });
}

if (userId) {
    pipeline.push({
        $match: {
            owner: new mongoose.Types.ObjectId(userId)
        }
    });
}

if (sortBy && sortType) {
    pipeline.push({
        $sort: {
            [sortBy]: sortType === "asc" ? 1 : -1
        }
    });
}

let videoagregate= Video.aggregate(pipeline);

let options={
    page:parseInt(page),
    limit:parseInt(limit)
}

const videos=await Video.aggregatePaginate(videoagregate,options)

if (!videos) {
    throw new apireject("No videos found", 404);
}

res.status(200).json(new Apiresolve("Videos fetched successfully", videos))


    
})

const publishAVideo = asynchandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
})

const getVideoById = asynchandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asynchandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asynchandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asynchandler(async (req, res) => {
    const { videoId } = req.params
})



export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}