
const { createPost, getAllPost, postLike,getAllLikes,getMentionPosts,deletePost,updatePost,getPost,getSavedPost,savePost} = require("../Controllers/PostController");
const router = require("express").Router();
const auth = require("../Middleware/Auth");
const multer = require('multer');
const {storageEngine} = require('../Utils/helper');
const upload = multer({ storage: storageEngine('Posts') });
router.post("/create",auth,upload.array('postImage'),createPost);
router.post("/update",auth,upload.array('postImage'),updatePost);
router.get("/getAllPost",auth, getAllPost);
router.get("/:id/getPost",auth, getPost);
router.post("/postLike",auth, postLike);
router.post("/getLikes",auth, getAllLikes);
router.get("/getMentionPosts/:id",auth, getMentionPosts);
router.post("/deletePost/:id", auth, deletePost);
router.get("/savedPosts",auth, getSavedPost);
router.post("/savePost",auth, savePost);
module.exports = router;
