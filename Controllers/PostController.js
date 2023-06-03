const Post = require("../Models/Post");
const User = require("../Models/User");
const mongoose = require("mongoose");

module.exports.createPost = async (req, res) => {
    try {
        let postData = JSON.parse(req.body?.post);
        let post = new Post({...postData,imageUrl: req?.file?.filename ? `/Posts/${req?.file?.filename}`:''});
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


module.exports.updatePost = async (req, res) => {
    try {
    //     let postData = JSON.parse(req.body?.post);
    //     let post = new Post({...postData,imageUrl: req?.file?.filename ? `/Posts/${req?.file?.filename}`:''});
    //     post.save(function (error, document) {
    //         if (error) {
    //             res.status(400).send({success: false, msg: "Request Failed", data: error});
    //         } else {
    //             res.status(201).send({success: true, msg: "Post Created", data: document});
    //         }
    //     });
    // } catch (ex) {
    //
    // }

        let data = JSON.parse(req.body?.post);
        console.log("data", data)
        let post = new Post({...data,imageUrl: req?.file?.filename ? `/Posts/${req?.file?.filename}`:''});
        // if(!req?.body?.profile)
        // {
        //     data.profile_url= `/Posts/${req?.file?.filename}`
        // }
        let postData = await Post.findOneAndUpdate({_id:data._id}, post).lean();

        if (postData) {
            return res.status(201).send({success: true, msg: "Post Updated Successfully",data:'document'});
        } else {
            return res.status(400).send({success: false, msg: "Post Update Failed", data: null});
        }
    } catch (ex) {
        res.send(ex);
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
                    mentions:1,
                    imageUrl:1
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

module.exports.deletePost = async  (req, res)=>{
    try{
        if (!req.params.id) {
            return res.json({ msg: "User id is required " });
        }
        else {
            console.log("reaefads", req.params)
            let post = await Post.deleteOne({_id:req.params.id})
            if(post){
                return res.status(200).send({success: true,msg:"Post Deleted Successfully",});
            }
            else{
                return res.status(400).send({success: false,msg:"failed",});
            }
        }
    } catch (ex) {
        res.send(ex);
    }
}
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
module.exports.getPost = async (req, res) => {
    try {
        let {id} = req.params;
        let post = await Post.aggregate([
            {$match:{_id: mongoose.Types.ObjectId(id)}},
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
                    mentions:1,
                    imageUrl:1
                }
            },
        ])
        if(post){
            res.status(200).send({success: true, msg: "Success", data: post});
        }
        else{
            res.status(400).send({success: false, msg: "Something went wrong!", data:null});
        }
    } catch (ex) {

    }
};
