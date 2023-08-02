const User = require("../Models/User");
const Post = require("../Models/Post");
const mongoose = require('mongoose');
async function getFollowerFollowing(id,localField,page,pageSize){
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
        {
            $addFields: {
                // Calculate the total number of author_info elements before pagination
                totalAuthorInfo: { $size: "$author_info" }
            }
        },
        {
            $project: {
                author_info: {
                    // Apply pagination using the $slice operator
                    $slice: ['$author_info', parseInt(page) * parseInt(pageSize), parseInt(pageSize)]
                },
                totalAuthorInfo: 1 // Include the total count in the result
            }
        },
    ]);
    if(data?.length && data[0]?.author_info?.length){
        let followerData = data[0]?.author_info.map(async (ele)=> {
            let posts = await Post.find({createdBy: mongoose.Types.ObjectId(ele?._id)});
            return {...ele,posts}
        });
        let followers = await Promise.all(followerData);
        return {data:followers,total: data[0]?.totalAuthorInfo};
    }
    else {
        return null;
    }
}
module.exports.getFollowers = async (req, res) => {
    try {
        let {id,type,pageSize,page} = req.query;
        let data = await getFollowerFollowing(id,type.toLowerCase(),page,pageSize);
        if(data && data?.data?.length){
            res.status(200).send({success: true, msg: "Followers fetch successfully", data: data?.data,total:data?.total});
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
