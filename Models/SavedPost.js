const mongoose = require("mongoose");

const SavedPost = new mongoose.Schema({
    userId:{
        type:mongoose.Types.ObjectId
    },
    postId:{
        type: Array
    },
},{
    timestamps: true,
    versionKey:false,
    toJSON: {
        transform(doc, ret) {
            delete ret.password;
            return ret;
        },
    }
});

module.exports = mongoose.model("saved-post", SavedPost);
