 import mongoose from "mongoose";

import { db_name } from "../constants.js";

let connectionInstance=async()=>{
    try{
        let connectdb=await mongoose.connect(`${process.env.MONGO_URI}/${db_name}`)
        console.log(`mongoose connected ${connectdb.connection.host}`);
        
    }catch(error){
        console.log("error occured in connection ",error);
        process.exit(1);
    }
}
export default connectionInstance