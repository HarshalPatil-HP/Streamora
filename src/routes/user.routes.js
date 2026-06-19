import { Router } from "express";
import { 
    registerUser, loginUser, RefreshAccesstoken, logoutUser, updatePassword, getUserProfile, updateUserProfile, updateavtar, updatecoveravtar, getuserchannelprofile, getWatchHistory
} from "../controllers/user.controllers.js"; 

import { upload } from "../middlewares/multer.middleware.js";
import { authmiddleware } from "../middlewares/auth.middleware.js";

const router = Router();


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
router.route("/login").post(loginUser);

router.route("/refresh-token").post(RefreshAccesstoken); 
router.route("/channel/:uname").get(getuserchannelprofile); 


router.route("/logout").post(authmiddleware, logoutUser);
router.route("/watch-history").get(authmiddleware, getWatchHistory);

router.route("/profile").get(authmiddleware, getUserProfile);
router.route("/profile").patch(authmiddleware, updateUserProfile);
router.route("/profile/password").patch(authmiddleware, updatePassword);
router.route("/profile/avtar").patch(authmiddleware, upload.single("avtar"), updateavtar);
router.route("/profile/coveravtar").patch(authmiddleware, upload.single("coveravtar"), updatecoveravtar);

export default router;