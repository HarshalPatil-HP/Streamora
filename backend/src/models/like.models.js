
import mongoose, { Schema } from "mongoose";

let likeschema = new Schema({
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video"
    },
    comment: {
        type: Schema.Types.ObjectId,
        ref: "Comment"
    },
    tweet: {
        type: Schema.Types.ObjectId,
        ref: "Tweet"
    },
    likedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
},
{ timestamps: true }
)

// Sparse unique indexes to prevent duplicate likes per user
// sparse: true means null values don't conflict with each other
likeschema.index({ likedBy: 1, video: 1 }, { unique: true, sparse: true })
likeschema.index({ likedBy: 1, comment: 1 }, { unique: true, sparse: true })
likeschema.index({ likedBy: 1, tweet: 1 }, { unique: true, sparse: true })

export let Like = mongoose.model("Like", likeschema)
