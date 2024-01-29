const User = require("../Models/User");
const Story = require("../Models/Story");
const mongoose = require("mongoose");
const Post = require("../Models/Post");
const Request = require("../Models/Requests");
const Comment = require("../Models/Comment");
const {ObjectID, ObjectId} = require("mongodb");

require("dotenv").config();
const secret_key = process.env.SECRET_KEY;
const passwordResetUrl = process.env.REACT_APP_URL;
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
            profile_url:1,
            privacy:1,
        },
        story_url:1,
        _id:1,
        userId:1,
    }
};
const postResponse = async (story,res) => {
    // res.status(200).send({success: true, msg: "", data: story});
    if(story && story.length ){
        res.status(200).send({success: true, msg: "", data: story});
    }
    else{
        res.status(200).send({success: false, msg: "", data: []});
    }
}
module.exports.GetAll = async (req, res) => {
    try {
        const user = await User.findById(req?.user?._id);

        const userIds = user?.followings || [];
        userIds.push(mongoose.Types.ObjectId(req?.user?._id));
        let stories = await Story.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'author_info'
                }
            },
            {
                $project: {
                    _id: 1,
                    story_url: 1,
                    userId: 1,
                    author_info: {
                        name: 1,
                        userName: 1,
                        profile_url: 1,
                        followings:1,
                    }
                }
            },
            {
                $match: {
                    'userId': {
                        $in: [...userIds]
                    }
                }
            },
            {
                $group: {
                    _id: '$userId',
                    author_info: { $first: '$author_info' },
                    story_url: { $push: '$story_url' }
                }
            },
            {
                $project: {
                    _id: 1,
                    story_url: {
                        $reduce: {
                            input: '$story_url',
                            initialValue: [],
                            in: { $concatArrays: ['$$value', '$$this'] }
                        }
                    },
                    author_info: 1
                }
            }
        ]);
        return postResponse(stories,res);
    } catch (ex) {
        res.status(400).send(ex)
    }
};

module.exports.getById = async (req, res) => {
    // try {
    //     const visitor = await ViewProfile.findOne({viewerId: req.user._id, userId: req.params.id}).lean();
    //     if (!visitor && req.params.id !== req.user._id) {
    //         // new ViewProfile({viewerId: req.user._id, userId: req.params.id}).save();
    //     }
    //     let visitors = await ViewProfile.find({userId: req.params.id});
    //     let rating = Math.round(visitors.length / 5);
    //     let user = await User.aggregate([
    //         {
    //             $match: {_id: mongoose.Types.ObjectId(req.params.id)}
    //         },
    //         {
    //             $lookup: {
    //                 from: 'posts',
    //                 localField: '_id',
    //                 foreignField: 'createdBy',
    //                 as: 'posts'
    //             }
    //         }
    //
    //     ]);
    //     let saved_post = [];
    //     if (req.user?._id === req.params.id) {
    //         saved_post = await Post.aggregate([
    //             {
    //                 $match: {
    //                     savedBy: {
    //                         $elemMatch: {
    //                             $eq: mongoose.Types.ObjectId(req.user._id)
    //                         }
    //                     },
    //                 }
    //             }
    //         ]);
    //     }
    //     if (user) {
    //         res.status(200).send({
    //             success: true,
    //             msg: "User Found",
    //             data: {...user[0], rating: rating, savedPost: saved_post?.length}
    //         });
    //     } else {
    //         res.status(404).send({success: false, msg: "User Not Found", data: null});
    //     }
    // } catch (ex) {
    //     res.send(ex);
    // }
}


module.exports.setStory = async  (req, res)=>{
    try{
        let {_id} = req.user;
        let data = req?.body;
        data.userId = _id;
        let story = new Story(data);
        story.save(function  (error, document) {
            if (error) {
                res.status(400).send({success: false, msg: "Request Failed", data: error});
            } else {
                User.findOneAndUpdate({_id: _id}, {isStory:true},{new:true}).lean();
                res.status(201).send({success: true, msg: "Story Created", data: document});
            }
        });
    }
    catch (e){

    }
}

module.exports.deleteStory = async  (req, res)=>{
    try{
        let { id } =  req.params;
        await Story.deleteOne({_id:id});
    }
    catch (e){

    }
}
