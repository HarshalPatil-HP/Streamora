import { registerUser} from "../controllers/user.controllers.js";
import {upload} from "../middlewares/multer.middleware.js"
import { Router } from "express";

let router=Router();

router.route("/register").post(
    upload.fields([
        {
            name:"avtar",
            maxCount:1
        },
        {
          name:"cover",
            maxCount:1   
        }
    ]),registerUser
)

export default router

