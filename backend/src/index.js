import dotenv from "dotenv"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const backendEnv = path.resolve(__dirname, "../.env")
const rootEnv = path.resolve(__dirname, "../../.env")

if (fs.existsSync(backendEnv)) {
  dotenv.config({ path: backendEnv })
} else if (fs.existsSync(rootEnv)) {
  dotenv.config({ path: rootEnv })
} else {
  dotenv.config()
}
import{app}from "./app.js"
import connectionInstance from "./db/index.js"

let port=process.env.PORT||8001

connectionInstance()
.then(()=>{
    app.listen(port,()=>{
        console.log(`Server started on port ${port}`)
    })
})
.catch((err)=>{
    console.error("Server failed to start:", err.message)
    process.exit(1)
})
