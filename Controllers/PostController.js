const Post = require("../Models/Post");
const User = require("../Models/User");

module.exports.createPost = async (req, res) => {
    try {
        let post = new Post(req.body);
        post.save(function (error, document) {
            if (error) {
                res.status(400).send({success: false, msg: "Request Failed", data: error});
            } else {
                res.status(201).send({success: true, msg: "Post Created", data: 'document'});
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
                        userName:1
                    },
                    createdBy:1,
                    content:1,
                    createdAt:1,
                    likes:1,
                    comments:1,
                    title:1,
                    hashTags:1,
                }
            }
        ])
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
        });
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
// module.exports.getRequest = async (req, res) => {
//     try {
//         let {type} = req?.params;
//         if(type === 'user'){
//             let requests = await Request.find({toUserId:{$in: req.user.user_id},status:{$nin:'accepted'}});
//             let result = requests.map(async (ele)=> {
//                 let user = await User.findOne({_id:ele?.fromUserId})
//                 return {
//                     content:user.name + ' has requested to follow you',
//                     _id: ele?._id,
//                 }
//             });
//             let final = await Promise.all(result);
//             res.status(200).send({success: true, msg: "User Requests fetch successfully", data: final});
//         }
//         else {
//             let requests = await Request.find();
//             res.status(200).send({success: true, msg: "Requests fetch successfully", data: requests});
//         }
//     } catch (ex) {
//
//     }
// };
module.exports.postLike = async (req, res) => {
    try {
        let {postId,likeBy} = req.body;
        let post = await Post.findOne({_id: postId});
        if(post.likes.includes(likeBy)){
            await Post.findOneAndUpdate({_id:postId}, { $pull: { "likes": likeBy } });
            res.status(200).send({success: true, msg: "Disliked", data: 'requestUpdate'});
        }
        else{
            await Post.findOneAndUpdate({_id:postId}, { $push: { "likes": likeBy } });
            res.status(200).send({success: true, msg: "Liked", data: 'requestUpdate'});
        }
    } catch (ex) {

    }
};
//
// module.exports.updateRequest = async (req, res) => {
//     try {
//         let { status, id } =  req.params;
//         if(status === 'accepted'){
//             let request = await Request.findOne({_id:id});
//             await User.findOneAndUpdate({_id:request?.fromUserId}, { $push: { "following": request?.toUserId } });
//             await User.findOneAndUpdate({_id:request?.toUserId}, { $push: { "followers": request?.fromUserId } });
//             let requestUpdate = await Request.deleteOne({_id:id});
//             res.status(200).send({success: true, msg: "Accepted", data: requestUpdate});
//         }
//         else if(status === 'rejected' || status === 'Requested'){
//             let requestDelete = await Request.deleteOne({_id:id});
//             res.status(200).send({success: true, msg: "Request Canceled", data: requestDelete});
//         }
//         else {
//             res.status(400).send({success: false, msg: "Something went wrong!", data: null});
//         }
//     } catch (ex) {
//
//     }
// };
