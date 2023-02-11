const { getFollowers,getFollowings,unFollow } = require("../Controllers/FollowerController");
const router = require("express").Router();
const auth = require("../Middleware/Auth");

router.get("/getFollowers/:id",auth, getFollowers);
router.get("/getFollowings/:id",auth, getFollowings);
router.post("/removeFollower",auth, unFollow);

module.exports = router;