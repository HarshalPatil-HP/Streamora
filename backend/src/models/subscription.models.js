import mongoose, { Schema } from "mongoose";

let subscriptionschema = new Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    channel: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

subscriptionschema.index({ subscriber: 1, channel: 1 }, { unique: true });

export let Subscription = mongoose.model("Subscription", subscriptionschema);
