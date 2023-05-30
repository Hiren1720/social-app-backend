const { sendRequest,getRequest,updateRequest } = require("../Controllers/RequestController");
const router = require("express").Router();
const auth = require("../Middleware/Auth");

router.post("/send",auth, sendRequest);
router.post("/update/:status/:id",auth, updateRequest);
router.get("/:type/requestGetByType",auth, getRequest);
module.exports = router;