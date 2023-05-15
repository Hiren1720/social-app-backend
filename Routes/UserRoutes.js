const multer = require('multer');
const {storageEngine} = require('../Utils/helper');
const upload = multer({ storage: storageEngine('Profiles') });
const { GetAll,getById,Register,Login,VerifyOTP,Update,Delete,LogOut,generateAccessToken,getProfileViewers  } = require("../Controllers/UserController");
const router = require("express").Router();
const auth = require("../Middleware/Auth");

router.post("/register", upload.single('profile'),Register);
router.post("/login", Login);
router.post("/verify-otp", VerifyOTP);
router.get("/profile/:id",auth, getById);
router.get("/profile-viewers",auth, getProfileViewers);
router.post("/logout",auth, LogOut);
router.get("/userAll",auth, GetAll);
router.post("/update",upload.single('profile'), Update);
router.post("/refreshToken", generateAccessToken);
router.delete("/delete/:id", Delete);

module.exports = router;
