import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {apireject} from "../utils/Apireject.js"
import {Apiresolve} from "../utils/Apiresolved.js"
import {asynchandler} from "../utils/asynchandler.js"
import {uploadOnCloudinary} from "../utils/claudinary.js"


const getAllVideos = asynchandler(async (req, res) => {
    /*   
    
📍 Step 6: The Pagination Execution (The Slicer)
What: Chop the massive list of videos down to a small chunk (like 10 videos) and actually run the database query.

Why: Fetching 50,000 videos at once will crash your server and burn through your database bandwidth. Sending 10 at a time is fast and efficient.

How: We will take our entire pipeline array from Step 2, and pass it into the Video.aggregatePaginate() function along with our page and limit numbers.

📍 Step 7: Send the Parcel (The Delivery)
What: Package the final 10 videos and send them to the frontend with a success message.

Why: The frontend needs a structured JSON response to physically draw the video thumbnails on the screen.

How: We use our standard res.status(200).json(...) structure with our custom Apiresolve class.
    */
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
const pipeline = [];

// 1. First Push: Search Query
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

// 2. Second Push: Channel Filter
if (userId) {
    pipeline.push({
        $match: {
            owner: userId // (Note: We usually convert this to mongoose.Types.ObjectId(userId) !)
        }
    });
}

// 3. Third Push: Sorting
if (sortBy && sortType) {
    pipeline.push({
        $sort: {
            [sortBy]: sortType === "asc" ? 1 : -1
        }
    });
}
    
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