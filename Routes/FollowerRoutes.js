const { getFollowers,getFollowings } = require("../Controllers/FollowerController");
const router = require("express").Router();
const auth = require("../Middleware/Auth");

router.get("/getFollowers",auth, getFollowers);
router.get("/getFollowings",auth, getFollowings);

module.exports = router;