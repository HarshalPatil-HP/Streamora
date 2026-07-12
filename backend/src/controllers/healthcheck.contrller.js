import { asynchandler } from "../utils/asynchandler.js";
 import { Apiresolve } from "../utils/Apiresolved.js";

 let healthcheck= asynchandler(async (req,res)=>{
    return res
    .status(200)
    .json(new Apiresolve(200,"ok","health passed"))
 })

 export {
    healthcheck
 }