const multer = require('multer');
const {storageEngine} = require('../Utils/helper');
const upload = multer({ storage: storageEngine('Profiles') });
const { GetAll,getById,Register,Login,VerifyOTP,Update,Delete,LogOut,generateAccessToken,getProfileViewers,setUserStatus, forgotPassword,resetPassword,blockUser,setPrivacy,getVisitorTime,setVisitorTime,updatePassword ,deActivateAccount } = require("../Controllers/UserController");
const router = require("express").Router();
const auth = require("../Middleware/Auth");

router.post("/register", upload.single('profile'),Register);
router.post("/login", Login);
router.post("/verify-otp", VerifyOTP);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/:id/profile",auth, getById);
router.get("/profile-viewers",auth, getProfileViewers);
router.post("/logout",auth, LogOut);
router.get("/userAll",auth, GetAll);
router.post("/update",upload.single('profile'),auth, Update);
router.post("/setPrivacy",auth, setPrivacy);
router.post("/visitorTime",auth, setVisitorTime);
router.get("/getDailyUsage",auth, getVisitorTime);
router.post("/block-user",auth, blockUser);
router.post("/refreshToken", generateAccessToken);
router.post("/deactivate-account",auth, deActivateAccount);
router.delete("/delete-account",auth, Delete);
router.post("/update-password",auth, updatePassword);
router.post("/status", setUserStatus);
module.exports = router;
