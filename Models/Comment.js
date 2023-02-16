const mongoose = require("mongoose");

const Comment = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    postId:{
        type: mongoose.Types.ObjectId,
    },
    replyId:{
        type: mongoose.Types.ObjectId,
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        required: true,
    },
    likes: {
        type: Array,
    },
},{
    timestamps: true,
    versionKey:false
});

module.exports = mongoose.model("comments", Comment);
