
 import mongoose, { Schema } from "mongoose";
 
 let likeschema=new Schema({
     
 
   
     owner:[
         {
             type:Schema.Types.ObjectId,
             ref:"User"
         }
     ],
      ownervideo:[
         {
             type:Schema.Types.ObjectId,
             ref:"Video"
         }
     ],
      ownertweet:[
         {
             type:Schema.Types.ObjectId,
             ref:"Tweet"
         }
     ],
      ownercomment:[
         {
             type:Schema.Types.ObjectId,
             ref:"Comment"
         }
     ],
    

     
 
 },
 {timestamps:true}
 )
 
 
 export let Like=mongoose.model("Like",likeschema)

