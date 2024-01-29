
const { GetAll,getById,setStory, deleteStory} = require("../Controllers/StoryController");
const router = require("express").Router();
const auth = require("../Middleware/Auth");
const {setVisitorTime} = require("../Controllers/UserController");


router.get("/:id/profile",auth, getById);
router.get("/getAllStories",auth, GetAll);
router.post("/create", auth,setStory);
router.delete("/:id", deleteStory);
module.exports = router;
