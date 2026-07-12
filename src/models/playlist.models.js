
import mongoose, { Schema } from "mongoose";

let playlistschema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    videos: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ]
},
{ timestamps: true }
)

export let Playlist = mongoose.model("Playlist", playlistschema)
