import { asynchandler } from "../utils/asynchandler.js"
import { Apiresolve } from "../utils/Apiresolved.js" 
import { apireject } from "../utils/Apireject.js"    
import { User } from "../models/user.models.js"      
import { uploadOnCloudinary } from "../utils/claudinary.js"
import  jwt  from "jsonwebtoken"
const genAccessandrefreshtoken = async (userid) => {
    try {
        const user = await User.findById(userid)
        if (!user) {
            throw new apireject(400, "cant find user!!")
        }
    
        const accesstoken = user.getaccesstoken()
        const refreshtoken = user.getacrefreshtoken()
    
        user.refreshtoken = refreshtoken
        await user.save({ validateBeforeSave: false })
        return { accesstoken, refreshtoken }
    } catch (error) {
        throw new apireject(400, "vo genarate vale function may gadbad hua hay")
    }
}

const registerUser = asynchandler(async (req, res) => {
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

    const avtar = await uploadOnCloudinary(avtarLocalpath);
    
    let cover = "";
    if (coverLocalpath) {
        cover = await uploadOnCloudinary(coverLocalpath);
    }

    if (!avtar) {
        throw new apireject(400, "Cloudinary upload failed");
    }

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

    res.status(201).json(new Apiresolve(200, created, "user created"));
});

const loginUser = asynchandler(async (req, res) => {
    const { email, password } = req.body

    if (!email) {
        throw new apireject(400, "invalid creditials")
    }

    let user = await User.findOne({
        $or: [{ email }]
    });

    if (!user) {
        throw new apireject(400, "invalid user try signin little boy")
    }

    const ispass = await user.isPasswordCorrect(password)
    
    if (!ispass) {
        throw new apireject(400, "password not match kid")
    }

    const { accesstoken, refreshtoken } = await genAccessandrefreshtoken(user._id)

    const loggedin = await User.findById(user._id).select("-password -refreshtoken")

    if (!loggedin) {
        throw new apireject(400, "notlgged in")
    }

    const option = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }

    res.status(200)
        .cookie("accesstoken", accesstoken, option)
        .cookie("refreshtoken", refreshtoken, option)
        .json(new Apiresolve(
            200,
            { user: loggedin, accesstoken, refreshtoken },
            "logged in successully"
        ))
})

const RefreshAccesstoken=asynchandler(async (req,res)=>{
    const incomingRefresh=req.cookies.refreshtoken

    if(!incomingRefresh){
        throw new apireject(401,"refresh token required")
    }
    try {
       const decoded= jwt.verify(
            incomingRefresh,
            process.env.REFRESH_TOKEN
        )
        const user=await User.findById(decoded?._id)
        if(!user){
            throw new apireject(401,"invalid refresh token user gadbadi")
        }
        if(incomingRefresh !==user?.refreshtoken){
            throw new apireject(401,"invalid refresh token in in db and req")
        }
         const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }
    const {accesstoken,refreshtoken:newrefreshtoken} =await genAccessandrefreshtoken(user._id)

    res
    .status(200)
    .cookie("acesstoken",accesstoken,options)
    .cookie("refreshtoken", newrefreshtoken, options)
    .json(
        new Apiresolve(
            200,
            {accesstoken,
                refreshtoken:newrefreshtoken,
                
            },
            "access token refreshtoken genrated successfully"
        )
    )
    } catch (error) {
        throw new apireject(401,"somethingwent erong while genarting refresh token")
    }

})

const logoutUser=asynchandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshtoken:undefined,
            }
        },{
            new:true
        })
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production"}
        return res
        .status(200)
        .clearCookie("accesstoken",options)
        .clearCookie("refreshtoken",options)
        .json(new Apiresolve(200,{},"logged out successfully"))
})

const updatePassword=asynchandler(async(req,res)=>{
    const {oldpassword,newpassword} = req.body
    if(!oldpassword || !newpassword){
        throw new apireject(400,"enter both old and new password")
    }
    let user=await User.findById(req.user._id)
    if(!user){
        throw new apireject(400,"user not found")
    }
    let ispass=await user.isPasswordCorrect(oldpassword)
    if(!ispass){
        throw new apireject(400,"old password not match")
    }
    user.password=newpassword;
    await user.save({validateBeforeSave:false})

    res
    .status(200)
    .json(new Apiresolve(200,{},"password updated successfully"))



    
})

const getUserProfile=asynchandler(async(req,res)=>{
    let user=await User.findById(req.user._id).select("-password -refreshtoken")
    if(!user){
        throw new apireject(400,"user not found")
    }

    res
    .status(200)
    .json(new Apiresolve(200,user,"user profile fetched successfully"))

})

const updateUserProfile=asynchandler(async(req,res)=>{
    const {email,fullname} = req.body
    if(!email || !fullname){
        throw new apireject(400,"enter both email and fullname")
    }

    let user=await User.findById(req.user._id)
    if(!user){
        throw new apireject(400,"user not found")
    }
    const updated=await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                email:email,
                fullname:fullname
            }
        },
        {new:true}
    ).select("-password -refreshtoken")
     if(!updated){
        throw new apireject(400,"email and fullname not updated")
    }

    res
    .status(200)
    .json(new Apiresolve(200,{},"updated profile"))


})

const updateavtar=asynchandler(async(req,res)=>{
     let avtarLocalpath = req.file.path;
        if (!avtarLocalpath) {   
            throw new apireject(400, "upload avtar");
        }

        const avtar= await uploadOnCloudinary(avtarLocalpath);
        if (!avtar) {
            throw new apireject(400, "Cloudinary upload failed");
        }
        const updated=await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                avtar:avtar.url
            }
        },
        {new:true}
    ).select("-password -refreshtoken")
     if(!updated){
        throw new apireject(400,"avtar not updated")
    }
    res
    .status(200)
    .json(new Apiresolve(200,{},"avtar updated successfully"))
        
})

const updatecoveravtar=asynchandler(async(req,res)=>{
    const coverpath=req.file.path
    if(!coverpath){
        throw new apireject(400, "upload cover ");
    }
    const cover=await uploadOnCloudinary(coverpath);
    if(!cover){
        throw new apireject(400, "error while uploading on claudinary");   
    }

    let updated=await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                cover:cover.url
            }
        },
        {new:true}
    ).select("-password -refreshtoken")
     if(!updated){
        throw new apireject(400,"cover not updated")
    }
    res
    .status(200)
    .json(new Apiresolve(200,{},"cover updated successfully"))
})


 const getuserchannelprofile = asynchandler(async (req, res) => {
    const { uname } = req.params;
    
    if (!uname?.trim()) {
        throw new apireject(400, "Username is required");
    }

    const channel = await User.aggregate([
        { 
            $match: {
                uname: uname.toLowerCase()
            }
        },
        {   // Lookup to get subscribers
            $lookup: {
                from: "subscriptions", 
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {   // Lookup to get subscribed channels
            $lookup: {
                from: "subscriptions", 
                localField: "_id",
                foreignField: "owneruser",
                as: "subscribedChannels"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                subscribedChannelsCount: {
                    $size: "$subscribedChannels"
                },
                issubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] }, 
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullname: 1,
                uname: 1,
                subscribersCount: 1,
                subscribedChannelsCount: 1,
                issubscribed: 1,
                avtar: 1,
                cover: 1,
                email: 1
                
            }
        }
    ]);

    if (!channel?.length) {
        throw new apireject(404, "Channel not found");
    }
    console.log(channel[0])

    return res.status(200).json(
        new Apiresolve(
            200, 
            channel[0], 
            "Channel profile fetched successfully"
        )
    );
});

const getWatchHistory=asynchandler(async(req,res)=>{
    const user = await User.aggregate([
        {
            $match: { 
                _id: mongoose.Types.ObjectId(req.user._id)
            }
        },{
            $lookup: {
                from: "videos",
                localField: "watchhistory",
                foreignField: "_id",
                as: "watchhistorydetails",
                  pipeline: [
                {
                    $lookup: {
                        from: "users",
                        localField: "owner",
                        foreignField: "_id",
                        as: "ownerDetails",
                        pipeline: [
                            {
                                $project: {
                                    fullname: 1,
                                    uname: 1,
                                    avtar: 1
                                }
                            }
                        ]
                    }
                    
                },
                {
                    $addFields: {
                        $first: "$ownerDetails"
                    }
                }
                
            ]
            }
          
        }

    ])
        if(!user?.length){  
            throw new apireject(404,"user not found")
        }
        res
        .status(200)
        .json(new Apiresolve(200,user[0].watchhistorydetails,"watch history fetched successfully"))
})


export { registerUser, loginUser,RefreshAccesstoken, logoutUser, updatePassword, getUserProfile, updateUserProfile, updateavtar,updatecoveravtar,getuserchannelprofile,getWatchHistory };