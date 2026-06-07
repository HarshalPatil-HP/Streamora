import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

let app=express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"16kb"}))

app.use(express.urlencoded({extended:true,limit:"16kb"}))

app.use(express.static("public"))

app.use(cookieParser())

import healthcheckrouter from "./routes/health.routes.js"
import userRouter from "./routes/user.routes.js"

app.use("/api/v1/healthcheck",healthcheckrouter)    
app.use("/api/v1/user",userRouter)    

export{app}




