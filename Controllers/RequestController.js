const Request = require("../Models/Requests");
const User = require("../Models/User");
const mongoose = require("mongoose");
module.exports.sendRequest = async (req, res) => {
    try {
        let request = new Request({...req.body,status:'pending'})
        request.save(function (error, document) {
            if (error) {
                res.status(400).send({success: false, msg: "Request Failed", data: error});
            } else {
                res.status(201).send({success: true, msg: "Requested", data: 'document'});
            }
        });
    } catch (ex) {

    }
};

module.exports.getRequest = async (req, res) => {
    try {
        let {type} = req?.params;
        if(type === 'user'){
            let requests = await Request.aggregate([
                { $match : {toUserId:mongoose.Types.ObjectId(req.user._id)} },
                {
                    $lookup:{
                        from: 'users',
                        localField: 'fromUserId',
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
                        _id:1
                    }
                },
            ])
            res.status(200).send({success: true, msg: "User Requests fetch successfully", data: requests});
        }
        else {
            let requests = await Request.find();
            res.status(200).send({success: true, msg: "Requests fetch successfully", data: requests});
        }
    } catch (ex) {

    }
};

module.exports.updateRequest = async (req, res) => {
    try {
        let { status, id } =  req.params;
        if(status === 'accepted'){
            let request = await Request.findOne({_id:id});
            await User.findOneAndUpdate({_id:request?.fromUserId}, { $push: { "followings": mongoose.Types.ObjectId(request?.toUserId) } });
            await User.findOneAndUpdate({_id:request?.toUserId}, { $push: { "followers": mongoose.Types.ObjectId(request?.fromUserId) } });
            let requestUpdate = await Request.deleteOne({_id:id});
            res.status(200).send({success: true, msg: "Accepted", data: requestUpdate});
        }
        else if(status === 'rejected'){
            let requestDelete = await Request.deleteOne({_id:id});
            res.status(200).send({success: true, msg: "Request Rejected", data: requestDelete});
        }
        else if(status === 'Requested'){
            let requestDelete = await Request.deleteOne({_id:id});
            res.status(200).send({success: true, msg: "Request Canceled", data: requestDelete});
        }
        else {
            res.status(400).send({success: false, msg: "Something went wrong!", data: null});
        }
    } catch (ex) {

    }
};