import { Router } from "express";
import { 
    registerUser, 
    loginUser, 
    logoutUser,
    updateavtar,
    updatecoveravtar,
    updateUserProfile,
    updatePassword,
    getUserProfile,
    RefreshAccesstoken
} from "../controllers/user.controllers.js"; 
import { upload } from "../middlewares/multer.middleware.js";
import { authmiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes
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

router.route("/logout").post(authmiddleware, logoutUser);
router.route("/updateavtar").post(authmiddleware, upload.single("avtar"), updateavtar);
router.route("/updatecover").post(authmiddleware, upload.single("cover"), updatecoveravtar);
router.route("/updateprofile").post(authmiddleware, updateUserProfile);
router.route("/updatepassword").post(authmiddleware, updatePassword);
router.route("/profile").get(authmiddleware, getUserProfile);

export default router;