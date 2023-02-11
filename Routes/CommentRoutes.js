const { createCommentOnPost,getCommentsById } = require("../Controllers/CommentController");
const router = require("express").Router();
const auth = require("../Middleware/Auth");

router.post("/create",auth, createCommentOnPost);
router.get("/getById/:id",auth, getCommentsById);

module.exports = router;