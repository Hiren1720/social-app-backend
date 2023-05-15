const User = require("../Models/User");
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
            }
        }).limit(pageSize).skip(pageSize * page).lean();
        if (users && users.length) {
            res.status(200).send({success: true, msg: "fetch successfully", data: users, total: total});
        } else {
            res.status(404).send({success: false, msg: "users not found", data: [], total: null});
        }
    } catch (ex) {
        res.send(ex)
    }
};
module.exports.VerifyOTP = async (req, res) => {
    try {
        const {otp, email} = req.body;
        const user = await User.findOne({email: email}).lean();
        let data = fs.readFileSync('Utils/otp.txt').toString()
        let verify = data.split('|')[0];
        let date = data.split('|')[1];
        let min = minutesDiff(new Date(date), new Date())
        if (verify === otp && min < 5) {
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
                res.status(200).send({success: true, token:tokens,data:user});
            }
            else {
                let user = new User({email:email,name:name,profile_url: picture})
                user.save(async function (error, document) {
                    if (error) {
                        res.status(400).send({success: false, msg: "Login failed", data: error});
                    } else {
                        const tokens = await generateTokens(document);
                        res.status(201).send({success: true, msg: "Successfully Login", tokens: tokens});
                    }
                });
            }
        }
        else if (user && !provider) {
            if (to_Decrypt(user.password) === password) {
                const tokens = await generateTokens(user);
                // let otp = generateOTP();
                // fs.writeFileSync('Utils/otp.txt', `${otp}|${new Date()}`);
                // await SendMail({
                //     user,
                //     subject: "Verify your account with OTP",
                //     text: "",
                //     html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                //               <div style="margin:50px auto;width:70%;padding:20px 0">
                //                 <div style="border-bottom:1px solid #eee">
                //                   <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Social App</a>
                //                 </div>
                //                 <p style="font-size:1.1em">Hi,</p>
                //                 <p>Thank you for choosing Social App. Use the following OTP to complete your Sign Up procedures. OTP is valid for 5 minutes</p>
                //                 <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
                //                 <p style="font-size:0.9em;">Regards,<br />Social App</p>
                //                 <hr style="border:none;border-top:1px solid #eee" />
                //               </div>
                //             </div>`,
                // })
                res.status(200).send({success: true, token:tokens,data:user});
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
        console.log("update", req)
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


module.exports.Delete = async (req, res) => {
    try {
        if (!req.params.id) {
            return res.json({msg: "User id is required "});
        } else {
            let user = await User.deleteOne({_id: req.params.id})
            if (user && user?.acknowledged) {
                return res.status(200).send({success: true, msg: "User Deleted Successfully",});
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
