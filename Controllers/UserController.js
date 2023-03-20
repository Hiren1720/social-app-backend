const User = require("../Models/User");
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const {to_Encrypt, to_Decrypt} = require("../Utils/encryptDecrypt");
const {generateTokens,verifyRefreshToken} = require('../Utils/generateTokens');
require("dotenv").config();
const secret_key = process.env.SECRET_KEY;

module.exports.GetAll = async (req, res) => {
    try {
        let {page,searchValue,pageSize} = req?.query;
        const total = await User.find().lean();
        const users = await User.find({userName: { "$regex": searchValue, "$options": "i" }}).limit(pageSize).skip(pageSize * page).lean();
        if(users && users.length){
            res.status(200).send({success: true,msg:"fetch successfully",data:users,total:total});
        }
        else {
            res.status(404).send({success: false,msg:"users not found",data:[],total:null});
        }
    } catch (ex) {
        res.send(ex)
    }
};

module.exports.Login = async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email: email}).lean();
        if (user) {
            if (to_Decrypt(user.password) === password) {
                const tokens = await generateTokens(user)
                await User.findOneAndUpdate({_id:user._id}, {status: true});

                // create reusable transporter object using the default SMTP transport
                // let transporter = nodemailer.createTransport({
                //     service: "gmail",
                //     host: "smtp.gmail.com",
                //     port: 587,
                //     secure: true,
                //     auth: {
                //         user: process.env.USER_EMAIL,
                //         pass: process.env.USER_PASS
                //     }
                // });
                //
                // // send mail with defined transport object
                // let info = await transporter.sendMail({
                //     from: process.env.USER_EMAIL, // sender address
                //     to: user?.email, // list of receivers
                //     subject: "Login Attempt!", // Subject line
                //     text: "Successfully Login", // plain text body
                //     html: "", // html bodys
                // });
                // console.log("Message sent: %s", info);
                // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
                res.status(200).send({success: true,token:tokens});
            } else {
                res.status(404).send({error: "password can't match"});
            }
        } else {
            res.status(404).send({error: "user not found"});
        }
    } catch (ex) {

    }
};
module.exports.LogOut = async (req, res) => {
    try {
        let { user_id} = req.user;
        await User.findOneAndUpdate({_id:user_id}, {status: false});
        return res.status(200).send({msg:'Logout Successfully',success: true})
    } catch (ex) {

    }
};
module.exports.Register = async (req, res) => {
    try {
        const { email,password} = req.body;
        const user = await User.findOne({ email }).lean();
        if (user){
            return res.json({ msg: "User already exists", status: false });
        }else{
            let user = new User({...req.body,password:to_Encrypt(password)})
            user.save(function (error, document) {
                if (error){
                    res.status(400).send({success: false,msg:"Registration failed",data:error});
                }
                else {
                    res.status(201).send({success: true,msg:"Successfully Registered",data:document});
                }
            });
        }
    } catch (ex) {

    }
};



module.exports.getById = async (req, res) => {
    try {
        const user = await User.find({ _id:  req.params.id  }).lean();
        if(user && user.length){
            res.status(200).send({success: true,msg:"User Found",data:user[0]});
        }
        else {
            res.status(404).send({success: false,msg:"User Not Found",data:null});
        }
    } catch (ex) {
        res.send(ex);
    }
};

module.exports.Update = async (req, res) => {
    try {
        const userId = req.body._id;
        const userData = await User.findByIdAndUpdate(
            userId,
            req.body,
            {new: true}
        );
        if(userData){
            return res.status(201).send({success: true,msg:"User Updated Successfully",data:userData});
        }
        else {
            return res.status(400).send({success: false,msg:"User Update Failed",data: null});
        }
    } catch (ex) {
        res.send(ex);
    }
};

module.exports.Delete = async (req, res) => {
    try {
        if (!req.params.id) {
            return res.json({ msg: "User id is required " });
        }
        else {
            let user = await User.deleteOne({_id:req.params.id})
            if( user && user?.acknowledged){
                return res.status(200).send({success: true,msg:"User Deleted Successfully",});
            }
            else{
                return res.status(400).send({success: false,msg:"failed",});
            }
        }
    } catch (ex) {
        res.send(ex);
    }
};
module.exports.generateAccessToken = async (req,res) => {
    verifyRefreshToken(req.body.refreshToken)
        .then(async ({ tokenDetails }) => {
            const user = await User.findById({_id: tokenDetails.user_id});
            const payload = { user_id: user._id,...user };
            const accessToken = jwt.sign(
                payload,
                secret_key,
                { expiresIn: "1d" }
            );
            res.status(200).json({
                success: true,
                token: {accessToken,refreshToken:req.body.refreshToken},
                message: "Access token created successfully",
            });
        })
        .catch((err) => res.status(400).json(err));
}
