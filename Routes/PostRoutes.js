
const { createPost, getAllPost, postLike,getAllLikes,getMentionPosts,deletePost,updatePost,getPost,getSavedPost,savePost,getPostByUserId} = require("../Controllers/PostController");
const { createCommentOnPost,getCommentsById } = require("../Controllers/CommentController");
const router = require("express").Router();
const auth = require("../Middleware/Auth");
const multer = require('multer');
const {storageEngine} = require('../Utils/helper');
const upload = multer({ storage: storageEngine('Posts') });
router.post("/create",auth,upload.array('postImage'),createPost);
router.post("/update",auth,upload.array('postImage'),updatePost);
router.get("/getAllPost",auth, getAllPost);
router.get("/getPost",auth, getPost);
router.get("/getPostsByUserId",auth, getPostByUserId);
// router.post("/postLike",auth, postLike);
router.get("/likes",auth, getAllLikes);
router.get("/getMentionPosts/:id",auth, getMentionPosts);
router.post("/deletePost/:id", auth, deletePost);
router.get("/getSavedPosts",auth, getSavedPost);
router.post("/savePost",auth, savePost);
router.post("/create",auth, createCommentOnPost);
router.get("/comments",auth, getCommentsById);
module.exports = router;
