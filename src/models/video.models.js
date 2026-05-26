
 import mongoose, { Schema } from "mongoose";
  import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
 let videoschema=new Schema({
     discription:{
         type:String,
         required:true,
         
 
     },
     thumbnail:{
         type:String,
         required:true,
 
     },
     title:{
           type:String,
           required:true
     },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User"
},
    
     videofile:{
          type:String,
         requiredd:true
 
     },
     views:{
          type:Number,
         required:true,
      default:0,
    },
    durationNumber:{
          type:Number,
         required:true,
      default:0,
    },
  
 
     
 
 },
 {timestamps:true}
 )
 
  videoschema.plugin(mongooseAggregatePaginate)
 export let Video=mongoose.model("Video",videoschema)

