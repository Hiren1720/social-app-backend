const User = require("../Models/User");

module.exports.getFollowers = async (req, res) => {
    try {
        let user = await User.findOne({_id:req.params.id});
        if(user && user.followers){
            let data = user.followers.length && user.followers.map(async (ele)=>{
                return await User.findOne({_id:ele});
            });
            let final = data ? await Promise.all(data):[];
            res.status(200).send({success: true, msg: "Followers fetch successfully", data: final});
        }
        else {
            res.status(400).send({success: false, msg: "Something went wrong!", data: null});
        }
    } catch (ex) {

    }
};

module.exports.getFollowings = async (req, res) => {
    try {
        let user = await User.findOne({_id:req.params.id});
        if(user && user.following){
            let data = user.following.length && user.following.map(async (ele)=>{
                return await User.findOne({_id:ele});
            });
            let final = data ? await Promise.all(data):[];
            res.status(200).send({success: true, msg: "Followings fetch successfully", data: final});
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
        await User.findOneAndUpdate({_id:followerId}, { $pull: { "following": followingId } });
        await User.findOneAndUpdate({_id:followingId}, { $pull: { "followers": followerId } });
        res.status(200).send({success: true, msg: status + "successfully"});
    } catch (ex) {

    }
};