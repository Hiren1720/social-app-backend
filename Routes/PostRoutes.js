const { createPost, getAllPost, postLike,getAllLikes,getMentionPosts } = require("../Controllers/PostController");
const router = require("express").Router();
const auth = require("../Middleware/Auth");

router.post("/create",auth, createPost);
router.get("/getAllPost",auth, getAllPost);
router.post("/postLike",auth, postLike);
router.post("/getLikes",auth, getAllLikes);
router.get("/getMentionPosts/:id",auth, getMentionPosts);
module.exports = router;