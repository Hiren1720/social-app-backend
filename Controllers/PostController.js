const Post = require("../Models/Post");
const User = require("../Models/User");
const mongoose = require("mongoose");
const lookupForUsers = (from,localField,foreignField,as) => {
    return {$lookup:{
        from: from,
        localField: localField,
        foreignField: foreignField,
        as: as
    }}
};
const projectForPost = {
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
        imageUrl:1,
        savedBy:1,
    }
};
module.exports.createPost = async (req, res) => {
    try {
        let postData = JSON.parse(req.body?.post);
        let post = new Post({...postData,imageUrl: req?.files?.length > 0 ? req?.files.map(ele => {return {type:ele.mimetype.split('/')[0],url:`/Posts/${ele?.filename}`}}):[]});
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
        let data = JSON.parse(req.body?.post);
        let image = [];
        if(req?.files?.length > 0){
             image = req?.files.map(ele => {return {type:ele.mimetype.split('/')[0],url:`/Posts/${ele?.filename}`}})
        }
        const filteredArray = data?.imageUrl.filter(obj => Object.keys(obj).length !== 0);
        image.push(...filteredArray);

        let postData = await Post.findOneAndUpdate({_id:data._id}, {...data,imageUrl:[...image]}).lean();
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
        const {page} = req.query;
        let post = await Post.aggregate([
            {...lookupForUsers('users','createdBy','_id','author_info')},
            {...projectForPost},
            { '$facet'    : {
                    data: [ { $skip: parseInt(page) * 2 }, { $limit: 2 } ],
                    total:  [{ $count: "total" }]// add projection here wish you re-shape the docs
                } }
        ]).sort({createdAt:-1})
        if(post && post.length && post[0]?.data?.length && post[0]?.total?.length){
            res.status(200).send({success: true, msg: "", data: post[0]?.data,total: post[0]?.total[0]?.total});
        }
        else{
            res.status(200).send({success: false, msg: "", data: []});
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
            },
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
            return res.status(400).send({ msg: "Post id is required " });
        }
        else {
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
        let {id} = req?.query;
        let likes = await Post.aggregate([
            {$match:{_id: mongoose.Types.ObjectId(id)}},
            {...lookupForUsers('users','likes','_id','likedUsers')},
            {
                $project: {
                    likedUsers: {
                        _id:1,
                        name: 1,
                        userName: 1,
                        profile_url: 1
                    },
                }
            }
        ]);
        if(likes?.length && likes[0]?.likedUsers?.length){
            res.status(200).send({success: true, msg: "", data: likes[0]?.likedUsers});
        }
        else{
            res.status(400).send({success: false, msg: "Something went wrong!", data: null});
        }
    } catch (ex) {
        res.status(400).send({success: false, msg: "Something went wrong!", error: ex});
    }
};
module.exports.postLike = async (req, res) => {
    try {
        let {postId,likeBy} = req.body;
        let post = await Post.findOne({_id: postId}).lean();
        if (post) {
            if (post.likes.some(objId => objId.equals(likeBy))) {
                await Post.findOneAndUpdate({_id: postId}, {$pull: {"likes": mongoose.Types.ObjectId(likeBy)}}).lean();
                res.status(200).send({success: true, msg: "Disliked", data: 'requestUpdate'});
            } else {
                await Post.findOneAndUpdate({_id: postId}, {$push: {"likes": mongoose.Types.ObjectId(likeBy)}}).lean();
                res.status(200).send({success: true, msg: "Liked", data: 'requestUpdate'});
            }
        }
        else {
            res.status(404).send({success: false, msg: "Post not found!", data: null});
        }
    } catch (ex) {

    }
};
module.exports.getPost = async (req, res) => {
    try {
        let {postId} = req.query;
        let post = await Post.aggregate([
            {$match:{_id: mongoose.Types.ObjectId(postId)}},
            {...lookupForUsers('users','createdBy','_id','author_info')},
            {...projectForPost},
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

module.exports.savePost = async (req, res) => {
    try {
        let {id} = req.body;
        let {_id} = req.user;
        const post = await Post.findOne({_id: id}).lean();
        if (post) {
            if(post.savedBy.some(objId => objId.equals(req.user._id))){
                await Post.findOneAndUpdate({_id:id},{$pull:{savedBy:mongoose.Types.ObjectId(_id)}});
                res.status(200).send({success: true, msg: "Unsaved"});
            }else{
                await Post.findOneAndUpdate({_id:id},{$push:{savedBy:mongoose.Types.ObjectId(_id)}});
                res.status(200).send({success: true, msg: "Saved"});
            }
        } else {
            res.status(404).send({success: false, msg: "Failed"});
        }
    } catch (ex) {
        res.send(ex);
    }
};

module.exports.getSavedPost = async (req, res) => {
    try {
        const {page} = req.query;
        let post = await Post.aggregate([
            {
                $match : {
                    savedBy : {
                        $elemMatch : {
                            $eq :mongoose.Types.ObjectId(req.user._id)
                        }
                    },
                }
            },
            {...lookupForUsers('users','createdBy','_id','author_info')},
            {...projectForPost},
            { '$facet'    : {
                    data: [ { $skip: parseInt(page) * 2 }, { $limit: 2 } ],
                    total:  [{ $count: "total" }]
                } }
        ]).sort({createdAt:-1})
        if(post && post.length && post[0]?.data?.length && post[0]?.total?.length){
            return res.status(200).send({success: true, msg: "Success", data: post[0]?.data,total:post[0]?.total[0]?.total});
        } else {
            return res.status(400).send({success: false, msg: "Failed", data: []});
        }
    } catch (e) {
        res.send(e);
    }
}
module.exports.getPostByUserId = async (req,res) => {
    try {
        const {page} = req.query;
        let post = await Post.aggregate([
            {
                $match : {
                    createdBy : mongoose.Types.ObjectId(req.query.id)
                }
            },
            {...lookupForUsers('users','createdBy','_id','author_info')},
            {...projectForPost},
            { '$facet'    : {
                    data: [ { $skip: parseInt(page) * 2 }, { $limit: 2 } ],
                    total:  [{ $count: "total" }]// add projection here wish you re-shape the docs
                } }
        ]).sort({createdAt:-1})
        if(post && post.length && post[0]?.data?.length && post[0]?.total?.length){
            return res.status(200).send({success: true, msg: "Success", data: post[0]?.data,total:post[0]?.total[0]?.total});
        } else {
            return res.status(400).send({success: false, msg: "Failed", data: []});
        }
    } catch (e) {
        res.send(e);
    }
}
