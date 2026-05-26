
 import mongoose, { Schema } from "mongoose";
 import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
 let commentschema=new Schema({
    
     contend:{
         type:String,
         required:true,
 
     },
   
    owner: {
    type: Schema.Types.ObjectId,
    ref: "User"
},
      ownervideos:[
         {
             type:Schema.Types.ObjectId,
             ref:"Video"
         }
     ],
    

 
 },
 {timestamps:true}
 )
 
 commentschema.plugin(mongooseAggregatePaginate)
 
 export let Comment=mongoose.model("Comment",commentschema)

