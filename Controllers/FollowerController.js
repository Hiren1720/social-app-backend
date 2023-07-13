const User = require("../Models/User");
const mongoose = require('mongoose');
function getFollowerFollowing(id,localField){
    return User.aggregate([
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
    ])
}
module.exports.getFollowers = async (req, res) => {
    try {
        let data = await getFollowerFollowing(req.params.id,'followers')
        if(data && data.length){
            console.log("getFollowers", data[0])
            res.status(200).send({success: true, msg: "Followers fetch successfully", data: data[0]?.author_info});
        }
        else {
            res.status(400).send({success: false, msg: "Something went wrong!", data: null});
        }
    } catch (ex) {

    }
};

module.exports.getFollowings = async (req, res) => {
    try {
        let data = await getFollowerFollowing(req.params.id,'following')
        if(data && data.length){
            res.status(200).send({success: true, msg: "Followings fetch successfully", data: data[0]?.author_info});
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
