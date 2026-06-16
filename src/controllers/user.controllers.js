import { asynchandler } from "../utils/asynchandler.js"
import { Apiresolve } from "../utils/Apiresolved.js" 
import { apireject } from "../utils/Apireject.js"    
import { User } from "../models/user.models.js"      
import { uploadOnCloudinary } from "../utils/claudinary.js"
import { jwt } from "jsonwebtoken"
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



export { registerUser, loginUser,RefreshAccesstoken };