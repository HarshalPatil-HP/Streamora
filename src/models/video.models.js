
import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

let videoschema = new Schema({
    title: {
        type: String,
        required: true
    },
    discription: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String,
        required: true
    },
    videofile: {
        type: String,
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    views: {
        type: Number,
        default: 0
    },
    durationNumber: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: true
    }
},
{ timestamps: true }
)

videoschema.plugin(mongooseAggregatePaginate)

export let Video = mongoose.model("Video", videoschema)
