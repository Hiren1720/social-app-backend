const { getFollowers,getFollowings,unFollow } = require("../Controllers/FollowerController");
const router = require("express").Router();
const auth = require("../Middleware/Auth");

router.get("/:id/getFollowers",auth, getFollowers);
router.get("/:id/getFollowings",auth, getFollowings);
router.post("/removeFollower",auth, unFollow);

module.exports = router;