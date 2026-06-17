
 import mongoose, { Schema } from "mongoose";
 
 let subscriptionschema=new Schema({

        owneruser:[
         {
             type:Schema.Types.ObjectId,
             ref:"User"
         }
     ],
    
        suscriber:[
         {
             type:Schema.Types.ObjectId,
             ref:"User"
         }
     ],
   
        channel:[
         {
             type:Schema.Types.ObjectId,
             ref:"User"
         }
     ],
   
     
 
 },
 {timestamps:true}
 )
 
 
 
 export let Subscription=mongoose.model("Subscription",subscriptionschema)

