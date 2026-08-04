import mongoose from "mongoose";

import { db_name } from "../constants.js";

let connectionInstance = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error(
        "MONGO_URI is missing. Add it to backend/.env or the project root .env file.",
      );
    }

    let connectdb = await mongoose.connect(process.env.MONGO_URI, {
      dbName: db_name,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};
export default connectionInstance;
