const { GetAll,getById,Register,Login,Update,Delete,LogOut  } = require("../Controllers/UserController");
const router = require("express").Router();
const auth = require("../Middleware/Auth");

router.post("/register", Register);
router.post("/login", Login);
router.get("/profile/:id",auth, getById);
router.post("/logout",auth, LogOut);
router.get("/userAll",auth, GetAll);
router.post("/update", Update);
router.delete("/delete/:id", Delete);

module.exports = router;