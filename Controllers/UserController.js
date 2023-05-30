const User = require("../Models/User");
const Post = require("../Models/Post");
const Comment = require("../Models/Comment");
const Request = require("../Models/Requests");
const mongoose = require("mongoose");
const ViewProfile = require("../Models/ViewProfile");
const jwt = require('jsonwebtoken');
const fs = require("fs");
const {to_Encrypt, to_Decrypt} = require("../Utils/encryptDecrypt");
const {generateTokens, verifyRefreshToken} = require('../Utils/generateTokens');
const {minutesDiff, SendMail} = require('../Utils/helper');
const {generateOTP} = require('../Utils/generateOTP');
require("dotenv").config();
const secret_key = process.env.SECRET_KEY;
const passwordResetUrl = process.env.PASSWORD_RESET_URL;

module.exports.GetAll = async (req, res) => {
    try {
        let {page, searchValue, pageSize} = req?.query;
        const total = await User.find().lean();
        const users = await User.find({
            userName: {
                "$regex": searchValue,
                "$options": "i"
            },blockedUsers:{$nin: mongoose.Types.ObjectId(req?.user?._id)}
        }).limit(pageSize).skip(pageSize * page).lean();
        if (users && users.length) {
            res.status(200).send({success: true, msg: "fetch successfully", data: users, total: total.length});
        } else {
            res.status(404).send({success: false, msg: "users not found", data: [], total: null});
        }
    } catch (ex) {
        res.send(ex)
    }
};
module.exports.VerifyOTP = async (req, res) => {
    try {
        const {otp, email,isDelete,id} = req.body;
        const user = await User.findOne({email: email}).lean();
        let data = fs.readFileSync('Utils/otp.txt').toString()
        let verify = data.split('|')[0];
        let date = data.split('|')[1];
        let min = minutesDiff(new Date(date), new Date())
        if (verify === otp && min < 5 && !isDelete) {
            const tokens = await generateTokens(user);
            await SendMail({
                user,
                subject: "Login Attempt!",
                text: "",
                html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                              <div style="margin:50px auto;width:70%;padding:20px 0">
                                <div style="border-bottom:1px solid #eee">
                                  <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Social App</a>
                                </div>
                                <p style="font-size:1.1em">Hi,</p>
                                <p>Thank you for choosing Social App. You have successfully logged in to your account.</p>
                                <p style="font-size:0.9em;">Regards,<br />Social App</p>
                                <hr style="border:none;border-top:1px solid #eee" />
                              </div>
                            </div>`,
            });
            fs.unlinkSync('Utils/otp.txt');
            res.status(200).send({success: true, token: tokens,data:user});
        } else if(verify === otp && min < 5 && isDelete){
            let user = await User.deleteOne({_id: mongoose.Types.ObjectId(id)})
            await Post.deleteMany({createdBy: mongoose.Types.ObjectId(id)});
            await Comment.deleteMany({createdBy: mongoose.Types.ObjectId(id)});
            await Request.deleteMany({fromUserId: mongoose.Types.ObjectId(id)});
            await ViewProfile.deleteMany({viewerId: mongoose.Types.ObjectId(id)});
            await ViewProfile.deleteMany({userId: mongoose.Types.ObjectId(id)});
            await User.updateMany(
                { followers: {$ne: [] } },
                { $pull: { "followers": mongoose.Types.ObjectId(id) } });
            await User.updateMany(
                { following: {$ne: [] } },
                { $pull: { "following": mongoose.Types.ObjectId(id) }});
            await User.updateMany(
                { blockedUsers: {$ne: [] } },
                { $pull: { "blockedUsers": mongoose.Types.ObjectId(id) }});
            if (user && user?.acknowledged) {
                fs.unlinkSync('Utils/otp.txt');
                return res.status(200).send({success: true, msg: "Deleted"});
            } else {
                return res.status(400).send({success: false, msg: "failed",});
            }
        } else {
            res.status(400).send({error: "Invalid OTP"});
        }
    } catch (ex) {

    }
};
module.exports.Login = async (req, res) => {
    try {
        const {email, password,name, type,provider,picture,email_verified} = req.body;
        const user = await User.findOne({email: email}).lean();
        if(provider && provider === 'google' && email_verified){
            if(user){
                const tokens = await generateTokens(user);
                res.status(200).send({success: true, token:tokens,data:user,provider:provider});
            }
            else {
                let user = new User({email:email,name:name,userName:name,profile_url: picture})
                user.save(async function (error, document) {
                    if (error) {
                        res.status(400).send({success: false, msg: "Login failed", data: error,});
                    } else {
                        const tokens = await generateTokens(document);
                        res.status(201).send({success: true, msg: "Successfully Login", token: tokens,data:document,provider:provider});
                    }
                });
            }
        }
        else if (user && !provider) {
            if (to_Decrypt(user.password) === password) {
                let otp = generateOTP();
                fs.writeFileSync('Utils/otp.txt', `${otp}|${new Date()}`);
                await SendMail({
                    user,
                    subject: "Verify your account with OTP",
                    text: "",
                    html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                              <div style="margin:50px auto;width:70%;padding:20px 0">
                                <div style="border-bottom:1px solid #eee">
                                  <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Social App</a>
                                </div>
                                <p style="font-size:1.1em">Hi,</p>
                                <p>Thank you for choosing Social App. Use the following OTP to complete your Sign Up procedures. OTP is valid for 5 minutes</p>
                                <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
                                <p style="font-size:0.9em;">Regards,<br />Social App</p>
                                <hr style="border:none;border-top:1px solid #eee" />
                              </div>
                            </div>`,
                })
                res.status(200).send({success: true,  message: 'Verify OTP'});
            } else {
                res.status(404).send({error: "password can't match"});
            }
        } else {
            res.status(404).send({error: "user not found"});
        }
    } catch (ex) {
        res.status(400).send({error:ex})
    }
};
module.exports.LogOut = async (req, res) => {
    try {
        let {user_id} = req.user;
        await User.findOneAndUpdate({_id: user_id}, {status: false});
        return res.status(200).send({msg: 'Logout Successfully', success: true})
    } catch (ex) {

    }
};
module.exports.Register = async (req, res) => {
    try {
        let data = JSON.parse(req.body?.user)
        const {email, password} = data;
        const user = await User.findOne({email}).lean();
        if (user) {
            return res.json({msg: "User already exists", status: false});
        } else {
            let user = new User({...data, password: to_Encrypt(password),profile_url: `/Profiles/${req?.file?.filename}`})
            user.save(function (error, document) {
                if (error) {
                    res.status(400).send({success: false, msg: "Registration failed", data: error});
                } else {
                    res.status(201).send({success: true, msg: "Successfully Registered", data: document});
                }
            });
        }
    } catch (ex) {

    }
};


module.exports.getById = async (req, res) => {
    try {
        const user = await User.findOne({_id: req.params.id}).lean();
        const visitor = await ViewProfile.findOne({viewerId: req.user._id,userId:req.params.id}).lean();
        if(!visitor && req.params.id !== req.user._id){
            new ViewProfile({viewerId:req.user._id,userId: req.params.id}).save();
        }
        if (user) {
            res.status(200).send({success: true, msg: "User Found", data: user});
        } else {
            res.status(404).send({success: false, msg: "User Not Found", data: null});
        }
    } catch (ex) {
        res.send(ex);
    }
};

module.exports.getProfileViewers = async (req, res) => {
    try {
        let user = await ViewProfile.aggregate([
            {$match:{userId:mongoose.Types.ObjectId(req.user._id)}},
            {
                $lookup:{
                    from: 'users',
                    localField: 'viewerId',
                    foreignField: '_id',
                    as: 'author_info'
                }
            },
            {
                $project:{
                    author_info:{
                        _id:1,
                        name:1,
                        userName:1,
                        profile_url:1
                    }
                }
            },
        ]).sort({createdAt:-1})
        if (user) {
            return res.status(200).send({success: true, msg: "Success",data: user});
        } else {
            return res.status(400).send({success: false, msg: "Failed", data: []});
        }
    } catch (ex) {
        res.send(ex);
    }
};


module.exports.Update = async (req, res) => {
    try {
        let data = JSON.parse(req.body?.user);
        if(!req?.body?.profile)
        {
            data.profile_url= `/Profiles/${req?.file?.filename}`
        }
        let userData = await User.findOneAndUpdate({_id:data._id}, data).lean();
        if (userData) {
            return res.status(201).send({success: true, msg: "User Updated Successfully",data:data});
        } else {
            return res.status(400).send({success: false, msg: "User Update Failed", data: null});
        }
    } catch (ex) {
        res.send(ex);
    }
};

module.exports.forgotPassword = async (req, res) => {
    try {
        let user = await User.findOne({email:req.body.email})
if(user){
    let info = await SendMail({
        user:{email:req.body.email},
        subject: "Social app account forgot password",
        text: "",
        html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                              <div style="margin:50px auto;width:70%;padding:20px 0">
                                <div style="border-bottom:1px solid #eee">
                                  <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Social App</a>
                                </div>
                                <p style="font-size:1.1em">Hi ${user?.name},</p>
                                <p>Sorry to hear you’re having trouble logging into Social App. We got a message that you forgot your password. If this was you, you can reset your password now.</p>
                                <a href="${passwordResetUrl}/${user?._id}" target="_blank" style="background: #00466a;margin: 0 auto;width: max-content;padding: 10px 10px;color: #fff;border-radius: 4px;text-decoration: none">Reset your Password</a>
                                <p style="font-size:0.9em;">Regards,<br />Social App</p>
                                <hr style="border:none;border-top:1px solid #eee" />
                              </div>
                            </div>`,
    })

    if (info?.messageId) {
        return res.status(201).send({success: true, msg: "Send Password reset link", data:req.body.email});
    } else {
        return res.status(400).send({success: false, msg: "Failed", data: null});
    }
}
       else{
    res.status(404).send({error: "user not found"});
}
    } catch (ex) {
        res.send(ex);
    }
};

module.exports.resetPassword = async (req, res) => {
    try {
        let user = await User.findOneAndUpdate({_id:req.body.id},{
            password:to_Encrypt(req.body.password)
        },{new:true}).lean();
        if(user){
            let result = user?.email.indexOf("@") - 3;
            let middleEmail = user?.email.split('@')[0].slice(3,result);
            let final = user?.email.replace(middleEmail,'***')
            let info = await SendMail({
                user:{email:user.email},
                subject: "Social app account password reset",
                text: "",
                html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                              <div style="margin:50px auto;width:70%;padding:20px 0">
                                <div style="border-bottom:1px solid #eee">
                                  <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Social App</a>
                                </div>
                                <p style="font-size:1.1em">Hi ${user?.name},</p>
                                <p>Your password for the Social app account <strong>${final}</strong> was changed on <strong>${new Date().toLocaleDateString()}</strong></p>
                                <p style="font-size:0.9em;">Regards,<br />Social App</p>
                                <hr style="border:none;border-top:1px solid #eee" />
                              </div>
                            </div>`,
            })
            if(info?.messageId){
                return res.status(201).send({success: true, msg: "Password reset success"});
            }else {
                return res.status(400).send({success: false, msg: "Something went wrong!"});
            }
        }else {
            return res.status(400).send({success: false, msg: "Password reset failed",});
        }
    } catch (ex) {
        res.send(ex);
    }
};


module.exports.Delete = async (req, res) => {
    try {
        if (!req.user._id) {
            return res.status(400).send({success:false,msg: "Something went wrong!"});
        } else {
            let user = await User.findOne({_id: req.user._id})
            if (user) {
                let otp = generateOTP();
                fs.writeFileSync('Utils/otp.txt', `${otp}|${new Date()}`);
                await SendMail({
                    user,
                    subject: "Verify your account with OTP",
                    text: "",
                    html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                              <div style="margin:50px auto;width:70%;padding:20px 0">
                                <div style="border-bottom:1px solid #eee">
                                  <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Social App</a>
                                </div>
                                <p style="font-size:1.1em">Hi,</p>
                                <p>Thank you for choosing Social App. Use the following OTP to complete your Delete Account procedures. OTP is valid for 5 minutes</p>
                                <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
                                <p style="font-size:0.9em;">Regards,<br />Social App</p>
                                <hr style="border:none;border-top:1px solid #eee" />
                              </div>
                            </div>`,
                })
                res.status(200).send({success: true,  message: 'Verify OTP'});
            } else {
                return res.status(400).send({success: false, msg: "failed",});
            }
        }
    } catch (ex) {
        res.send(ex);
    }
};
module.exports.generateAccessToken = async (req, res) => {
    verifyRefreshToken(req.body.refreshToken)
        .then(async ({tokenDetails}) => {
            const user = await User.findById({_id: tokenDetails.user_id});
            const payload = {user_id: user._id, ...user};
            const accessToken = jwt.sign(
                payload,
                secret_key,
                {expiresIn: "1d"}
            );
            res.status(200).json({
                success: true,
                token: {accessToken, refreshToken: req.body.refreshToken},
                message: "Access token created successfully",
            });
        })
        .catch((err) => res.status(400).json(err));
}

module.exports.blockUser = async (req, res) => {
    try {
        let { status,userId, blockUserId } =  req.body;
        if(status === 'block'){
            await User.findOneAndUpdate(
                { _id: mongoose.Types.ObjectId(blockUserId)},
                { $pull: { "followers": mongoose.Types.ObjectId(userId),"following": mongoose.Types.ObjectId(userId) } });
            await User.findOneAndUpdate({_id:mongoose.Types.ObjectId(userId)}, { $push: { "blockedUsers": mongoose.Types.ObjectId(blockUserId) },$pull: { "followers": mongoose.Types.ObjectId(blockUserId),"following": mongoose.Types.ObjectId(blockUserId) }}).lean();
            res.status(200).send({success: true, msg: "Success", data: ''});
        }
        else if(status === 'unBlock'){
            await User.findOneAndUpdate({_id:userId}, { $pull: { "blockedUsers": mongoose.Types.ObjectId(blockUserId) } }).lean();
            res.status(200).send({success: true, msg: "Success", data: ''});
        }
        else {
            res.status(400).send({success: false, msg: "Something went wrong!", data: null});
        }
    } catch (ex) {
        res.send(ex)
    }
};