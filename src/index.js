import dotenv from "dotenv"
import{app}from "./app.js"
import connectionInstance from "./db/index.js"

dotenv.config({
    path:"./.env"
})

let port=process.env.PORT||8001

connectionInstance()
.then(()=>{
    app.listen(port,()=>{
        console.log(`server is listning....${port}`);
        
    })
})
.catch((err)=>{
    console.log("error occured here i think ",err);
})
