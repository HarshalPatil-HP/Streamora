import { apireject } from "../utils/Apireject.js";
import { jwt } from "jsonwebtoken";
import { User } from "../models/user.models.js";
import { asynchandler } from "express-async-handler";

export const authmiddleware = asynchandler(async (req, res, next) => {
 const token =req.cookies?.access_token || req.heaser("Authorization").replace("Bearer ","")

 if(!token){
    throw new apireject(400,"token not found")
 }
 try{
    const decoded= jwt.verify(
            token,
            process.env.REFRESH_TOKEN
        )
        const user=await User.findById(decoded?._id)
        if(!user){
            throw new apireject(401,"invalid refresh token user gadbadi")
        }

        req.user=user
        next()

 }catch(error){
    throw new apireject(401,"invalid token")
 }




})


