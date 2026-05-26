

import mongoose, { Schema } from "mongoose";

let userschema=new Schema({
    uname:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true

    },
    udp:{
        type:String,
        required:true,

    },
    uavtaar:{
          type:String
    },
    watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    email:{
         type:String,
        required:true,
        unique:true,
     
        trim:true,
       

    },
    password:{
         type:String,
        requiredd:[true,"password requiredd"],

    },
    fullname:{
         type:String,
        required:true,
     
      
        trim:true,
        index:true
    },
    refreshtoken:{
        type:String
    }

    

},
{timestamps:true}
)


export let User=mongoose.model("User",userschema)