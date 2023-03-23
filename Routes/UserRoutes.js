const { GetAll,getById,Register,Login,VerifyOTP,Update,Delete,LogOut,generateAccessToken  } = require("../Controllers/UserController");
const router = require("express").Router();
const auth = require("../Middleware/Auth");

router.post("/register", Register);
router.post("/login", Login);
router.post("/verify-otp", VerifyOTP);
router.get("/profile/:id",auth, getById);
router.post("/logout",auth, LogOut);
router.get("/userAll",auth, GetAll);
router.post("/update", Update);
router.post("/refreshToken", generateAccessToken);
router.delete("/delete/:id", Delete);

module.exports = router;