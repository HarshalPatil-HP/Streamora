

import mongoose, { Schema } from "mongoose";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
let userschema=new Schema({
    uname:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true

    },
    avtar:{
        type:String,
        required:true,
    },
    cover:{
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
        required:[true,"password requiredd"],

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


userschema.pre("save", async function () {
    if (!this.isModified("password")) return;
    
    this.password = await bcrypt.hash(this.password, 10);
})

userschema.methods.isPasswordCorrect=async function (password) {
    return await bcrypt.compare(password,this.password)
}

userschema.methods.getaccesstoken=function(){
    return jwt.sign({
        _id:this._id,
        email:this.email
    },
    process.env.ACCESS_TOKEN,
    {
        expiresIn:process.env.ACCESS_EXPIRY
    }
)
}
userschema.methods.getacrefreshtoken=function(){
    return jwt.sign({
        _id:this._id,
       
    },
    process.env.REFRESH_TOKEN,
    {
        expiresIn:process.env.REFRESH_EXPIRY
    }
)
}


export let User=mongoose.model("User",userschema)