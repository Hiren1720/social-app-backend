const mongoose = require("mongoose");

const Comment = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    postId:{
        type: String,
    },
    replyId:{
        type: String,
    },
    createdBy: {
        type: String,
        required: true,
    },
    user:{
      type: Object
    },
    likes: {
        type: Array,
    },
},{
    timestamps: true,
});

module.exports = mongoose.model("comments", Comment);
