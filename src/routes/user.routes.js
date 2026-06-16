import { registerUser,logoutUser} from "../controllers/user.controllers.js";
import {upload} from "../middlewares/multer.middleware.js"
import { Router } from "express";
import { authmiddleware } from "../middlewares/auth.middleware.js";
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

router.route("/logout").post(authmiddleware,logoutUser)


export default router

