import { Router } from "express";
import { 
    registerUser, loginUser, RefreshAccesstoken, logoutUser, updatePassword, getUserProfile, updateUserProfile, updateavatar, updatecover, removeAvatar, removeCover, getuserchannelprofile, getWatchHistory
} from "../controllers/user.controllers.js"; 

import { upload } from "../middlewares/multer.middleware.js";
import { authmiddleware, optionalAuth } from "../middlewares/auth.middleware.js";
import { authLimiter, signupLimiter } from "../middlewares/rateLimit.middleware.js";

const router = Router();

router.route("/register").post(
    signupLimiter,
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "cover",
            maxCount: 1   
        }
    ]),
    registerUser
);
//unsecure route for login, no authentication required
router.route("/login").post(authLimiter, loginUser);
//route to access and get new access token using refresh token
router.route("/refresh-token").post(RefreshAccesstoken); 
router.route("/channel/:uname").get(optionalAuth, getuserchannelprofile); 


//secure routes that require authentication
router.route("/logout").post(authmiddleware, logoutUser);
router.route("/watch-history").get(authmiddleware, getWatchHistory);
router.route("/profile").get(authmiddleware, getUserProfile);
router.route("/profile/update").patch(authmiddleware, updateUserProfile);
router.route("/profile-password").patch(authLimiter, authmiddleware, updatePassword);
router.route("/profile/avatar").patch(authmiddleware, upload.single("avatar"), updateavatar);
router.route("/profile/avatar").delete(authmiddleware, removeAvatar);
router.route("/profile/cover").patch(authmiddleware, upload.single("cover"), updatecover);
router.route("/profile/cover").delete(authmiddleware, removeCover);

export default router;