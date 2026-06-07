import { asynchandler } from "../utils/asynchandler.js"
import { Apiresolve } from "../utils/Apiresolved.js" 
import { apireject } from "../utils/Apireject.js"    
import { User } from "../models/user.models.js"      
import { uploadOnCloudinary } from "../utils/claudinary.js"

const registerUser = asynchandler(async (req, res) => {
    console.log("1. Waiter entered the Kitchen!");

    const { uname, email, password, fullname } = req.body;

    if ([uname, email, password, fullname].some((field) => field?.trim() === "")) {
        throw new apireject(400, "enter all credentials");
    }

    let existUser = await User.findOne({
        $or: [{ uname }, { email }]
    });

    if (existUser) {
        throw new apireject(400, "already exist user");
    }

    let avtarLocalpath = req.files?.avtar?.[0]?.path;
    let coverLocalpath = req.files?.coveravtar?.[0]?.path;
    
    if (!avtarLocalpath) {
       throw new apireject(400, "upload avtar");
    }

    console.log("2. Handing file to Cloudinary...");
    const avtar = await uploadOnCloudinary(avtarLocalpath);
    
    let cover = "";
    if (coverLocalpath) {
        cover = await uploadOnCloudinary(coverLocalpath);
    }

    if (!avtar) {
        throw new apireject(400, "Cloudinary upload failed");
    }

    console.log("3. Cloudinary done! Saving to Database...");
    
    let user = await User.create({
        uname: uname.toLowerCase(),
        email,
        password,
        fullname,
        avtar: avtar.url,
        cover: cover?.url || ""
    });
    
    let created = await User.findById(user._id).select("-password -refreshtoken");
    
    if (!created) {
       throw new apireject(500, "problem in user creation");
    }

    console.log("4. User Saved! Sending response...");
    
    res.status(201).json(new Apiresolve(200, created, "user created"));
});

export { registerUser };