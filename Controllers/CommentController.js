const Comment = require("../Models/Comment");
const Post = require("../Models/Post");
const mongoose = require("mongoose");

module.exports.createCommentOnPost = async (req, res) => {
    try {
        let comment = new Comment(req.body);
        comment.save(async function (error, document) {
            if (error) {
                res.status(400).send({success: false, msg: "Request Failed", data: error});
            } else {
                if(document?.postId){
                    await Post.findOneAndUpdate({_id:document?.postId}, { $push: { "comments": document?._id } }).lean();
                }
                res.status(201).send({success: true, msg: "Comment Added", data: document});
            }
        });
    } catch (ex) {

    }
};
module.exports.getCommentsById = async (req, res) => {
    try {
        let {id} = req?.query;
        let comments = await Comment.aggregate([
            {$match:{postId:mongoose.Types.ObjectId(id) }},
            {
                $lookup: {
                    from: 'users',
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'author_info',
                },
            },
            {
                $project: {
                    author_info:{
                        userName:1,
                        name:1,
                        profile_url: 1
                    },
                    content:1,
                    createdBy:1,
                    likes:1,
                    postId:1,
                }
            }
        ])
        if(comments && comments.length){
            res.status(200).send({success: true, msg: "", data: comments});
        }
        else{
            res.status(400).send({success: false, msg: "", data: null});
        }
    } catch (ex) {
        res.status(400).send({success: false, msg: "", error: ex});
    }
};

