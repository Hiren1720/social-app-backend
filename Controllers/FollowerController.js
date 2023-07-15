const User = require("../Models/User");
const Post = require("../Models/Post");
const mongoose = require('mongoose');
async function getFollowerFollowing(id,localField){
    let data = await User.aggregate([
        {$match:{_id:mongoose.Types.ObjectId(id)}},
        {
            $lookup:{
                from: 'users',
                localField: localField,
                foreignField: '_id',
                as: 'author_info'
            }
        },
        {
            $project:{
                author_info:{
                    blockedUsers:0,
                    password:0,
                    updatedAt:0,
                },
            }
        },
    ]);
    if(data?.length && data[0]?.author_info){
        data = data[0]?.author_info.map(async (ele)=> {
            let posts = await Post.find({createdBy: mongoose.Types.ObjectId(ele?._id)});
            return {...ele,posts}
        })
        return await Promise.all(data);
    }
    else {
        return null;
    }
}
module.exports.getFollowers = async (req, res) => {
    try {
        let {id,type} = req.query;
        let data = await getFollowerFollowing(id,type.toLowerCase());
        if(data && data.length){
            res.status(200).send({success: true, msg: "Followers fetch successfully", data: data});
        }
        else {
            res.status(400).send({success: false, msg: "Something went wrong!", data: null});
        }
    } catch (ex) {

    }
};

module.exports.unFollow = async (req, res) => {
    try {
        let {followerId,followingId,status} = req.body;
        await User.findByIdAndUpdate({_id:followerId}, { $pull: { "following": mongoose.Types.ObjectId(followingId) } });
        await User.findByIdAndUpdate({_id:followingId}, { $pull: { "followers": mongoose.Types.ObjectId(followerId) } });
        res.status(200).send({success: true, msg: status + "successfully"});
    } catch (ex) {

    }
};