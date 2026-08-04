import mongoose, { Schema } from "mongoose";

// Tracks per-user (or per-device for anonymous) view events
// Unique on (identifier, videoId) to prevent duplicate row creation
const videoViewSchema = new Schema(
  {
    videoId: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
    // For logged-in users: their userId. For anonymous: IP+UA hash
    identifier: {
      type: String,
      required: true,
    },
    viewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false },
);

// Compound unique index: one record per user+video pair
videoViewSchema.index({ videoId: 1, identifier: 1 }, { unique: true });

export const VideoView = mongoose.model("VideoView", videoViewSchema);
