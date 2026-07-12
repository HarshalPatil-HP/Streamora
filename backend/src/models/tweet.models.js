
 import mongoose, { Schema } from "mongoose";
 
 let tweetschema=new Schema({

     contend:{
         type:String,
         required:true,
 
     },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
},
 {timestamps:true}
 )
 
 
 export let Tweet=mongoose.model("Tweet",tweetschema)

