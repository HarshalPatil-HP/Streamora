import { apireject } from "../utils/Apireject.js";
import jwt from "jsonwebtoken"; 
import { User } from "../models/user.models.js";
import { asynchandler } from "../utils/asynchandler.js"; 

export const authmiddleware = asynchandler(async (req, res, next) => { 
    try {
       
        const token = req.cookies?.accesstoken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new apireject(401, "Unauthorized request: Token not found");
        }

        const decoded = jwt.verify(
            token,
            process.env.ACCESS_TOKEN 
        );

        
        const user = await User.findById(decoded?._id).select("-password -refreshtoken");
        
        if (!user) {
            throw new apireject(401, "Invalid Access Token");
        }

        req.user = user;
        next(); 

    } catch (error) {
        throw new apireject(401, error?.message || "Invalid access token");
    }
});