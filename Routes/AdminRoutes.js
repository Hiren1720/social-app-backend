const { GetAll,getById,Register,Update,Delete  } = require("../Controllers/AdminController");
const router = require("express").Router();

router.post("/create", Register);
router.get("/get/:id", getById);
router.get("/all", GetAll);
router.post("/update", Update);
router.delete("/delete/:id", Delete);

module.exports = router;