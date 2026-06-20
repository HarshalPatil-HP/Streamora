
import { Router } from "express";
import { 
    registerUser, loginUser, RefreshAccesstoken, logoutUser, updatePassword, getUserProfile, updateUserProfile, updateavtar, updatecoveravtar, getuserchannelprofile, getWatchHistory
} from "../controllers/user.controllers.js"; 

import { upload } from "../middlewares/multer.middleware.js";
import { authmiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

console.log("user routes connected");

router.route("/register").post(
    upload.fields([
        {
            name: "avtar",
            maxCount: 1
        },
        {
            name: "coveravtar",
            maxCount: 1   
        }
    ]),
    registerUser
);
//unsecure route for login, no authentication required
router.route("/login").post(loginUser);
//route to access and get new access token using refresh token
router.route("/refresh-token").post(RefreshAccesstoken); 
router.route("/channel/:uname").get(getuserchannelprofile); 
//test route to check if the router is connected
router.route("/ping").get((req, res) => {
    res.status(200).json({ message: "PONG! Router is connected!" })
});

//secure routes that require authentication
router.route("/logout").post(authmiddleware, logoutUser);
router.route("/watch-history").get(authmiddleware, getWatchHistory);
router.route("/profile").get(authmiddleware, getUserProfile);
router.route("/profile/update").patch(authmiddleware, updateUserProfile);
router.route("/profile-password").patch(authmiddleware, updatePassword);
router.route("/profile/avtar").patch(authmiddleware, upload.single("avtar"), updateavtar);
router.route("/profile/coveravtar").patch(authmiddleware, upload.single("coveravtar"), updatecoveravtar);

export default router;