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
    /*
    📍 Step 1: Extract the Text (The Mailroom)
What: Grab the title and description from req.body.

Why: You need the text data to save into the database later.

How: You already wrote this line perfectly! const { title, description } = req.body;

📍 Step 2: Validate the Text (The Bouncer)
What: Check if the user accidentally sent an empty title or description.

Why: We don't want blank videos in our database. It ruins the user experience.

How: Write a simple if statement to check if title or description are missing or empty. If they are, throw an API error.

📍 Step 3: Extract the Local Files (The Cargo Bay)
What: Grab the temporary local paths for the video file and the thumbnail image from req.files.

Why: req.body only carries text. Files travel through a different path (usually handled by a middleware like Multer). We need to verify that the user actually attached a video and a thumbnail before proceeding.

How: We look inside req.files?.videoFile[0]?.path and req.files?.thumbnail[0]?.path. If they don't exist, throw an error.

📍 Step 4: Upload to Cloudinary (The Cloud Storage)
What: Send the local video and thumbnail files from your server directly to Cloudinary, and wait for Cloudinary to send back the permanent URLs.

Why: You should never store heavy MP4 files directly in your MongoDB database (it will crash). MongoDB is for text. Cloudinary is for media storage.

How: We will pass our local file paths to our custom uploadOnCloudinary() utility function. We will also extract the duration of the video that Cloudinary automatically calculates for us!

📍 Step 5: Save to Database (The Record Book)
What: Create a brand new document in the Video collection in MongoDB.

Why: Now that Cloudinary is safely hosting the heavy files, MongoDB just needs to store the text and the links so we can fetch them later (like we did in the last controller!).

How: We use Video.create({}) and pass in the title, description, the Cloudinary URLs for the video and thumbnail, the duration, and importantly, the owner (which we will get from req.user._id).

📍 Step 6: Send the Parcel (The Success Message)
What: Send a clean JSON response back to the frontend verifying the video is live.

Why: The frontend needs a confirmation to stop the "Uploading..." loading spinner and redirect the user to their new video.

How: We use our standard res.status(200).json(...) structure with our custom Apiresolve class.
    */
    const { title, description} = req.body
    

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