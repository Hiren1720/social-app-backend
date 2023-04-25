const Post = require("../Models/Post");
const User = require("../Models/User");

module.exports.createPost = async (req, res) => {
    try {
        let post = new Post(req.body);
        post.save(function (error, document) {
            if (error) {
                res.status(400).send({success: false, msg: "Request Failed", data: error});
            } else {
                res.status(201).send({success: true, msg: "Post Created", data: document});
            }
        });
    } catch (ex) {

    }
};
module.exports.getAllPost = async (req, res) => {
    try {
        let post = await Post.aggregate([
            {
                $lookup:{
                    from: 'users',
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'author_info'
                }
            },
            {
                $project:{
                    author_info:{
                        name:1,
                        userName:1,
                        profile_url:1
                    },
                    createdBy:1,
                    content:1,
                    createdAt:1,
                    likes:1,
                    comments:1,
                    title:1,
                    hashTags:1,
                    device:1,
                    mentions:1
                }
            },
        ]).sort({createdAt:-1})
        if(post && post.length){
            res.status(200).send({success: true, msg: "", data: post});
        }
        else{
            res.status(400).send({success: false, msg: "", data: null});
        }
    } catch (ex) {
        res.status(400).send({success: false, msg: "", error: ex});
    }
};
module.exports.getMentionPosts = async (req, res) => {
    try {
        let {id} = req?.params;
        let post = await Post.aggregate([
            {
                $match : {
                    mentions : {
                        $elemMatch : {
                            $and : [
                                { id : id }
                            ]
                        }
                    },
                }
            }
        ]);
        if(post && post.length){
            res.status(200).send({success: true, msg: "", data: post});
        }
        else{
            res.status(400).send({success: false, msg: "", data: null});
        }
    } catch (ex) {
        res.status(400).send({success: false, msg: "", error: ex});
    }
};
module.exports.getAllLikes = async (req, res) => {
    try {
        let users = await User.find({
            '_id': { $in: req?.body}
        }).lean();
        if(users && users.length){
            res.status(200).send({success: true, msg: "", data: users});
        }
        else{
            res.status(400).send({success: false, msg: "", data: null});
        }
    } catch (ex) {
        res.status(400).send({success: false, msg: "", error: ex});
    }
};
module.exports.postLike = async (req, res) => {
    try {
        let {postId,likeBy} = req.body;
        let post = await Post.findOne({_id: postId}).lean();
        if(post.likes.includes(likeBy)){
            await Post.findOneAndUpdate({_id:postId}, { $pull: { "likes": likeBy } }).lean();
            res.status(200).send({success: true, msg: "Disliked", data: 'requestUpdate'});
        }
        else{
            await Post.findOneAndUpdate({_id:postId}, { $push: { "likes": likeBy } }).lean();
            res.status(200).send({success: true, msg: "Liked", data: 'requestUpdate'});
        }
    } catch (ex) {

    }
};