const { getFollowers,unFollow } = require("../Controllers/FollowerController");
const router = require("express").Router();
const auth = require("../Middleware/Auth");

router.get("/get",auth, getFollowers);
router.post("/removeFollower",auth, unFollow);

module.exports = router;