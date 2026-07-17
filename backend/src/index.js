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
/* it will listen if mongo is connevted , fixed by harshal*/
connectionInstance()
.then(()=>{
    app.listen(port,()=>{
        console.log(`server is listning....${port}`);
        
    })
})
.catch((err)=>{
    console.log("error occured here i think ",err);
})
