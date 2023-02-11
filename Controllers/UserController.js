const User = require("../Models/User");
const jwt = require('jsonwebtoken');
const {to_Encrypt, to_Decrypt} = require("../Utils/encryptDecrypt");
require("dotenv").config();
const secret_key = process.env.SECRET_KEY;

module.exports.GetAll = async (req, res) => {
    try {
        let {user_id} = req.user;
        const users = await User.find({_id:{$nin: user_id}})
        if(users && users.length){
            res.status(200).send({success: false,msg:"fetch successfully",data:users});
        }
        else {
            res.status(404).send({success: false,msg:"users not found",data:users});
        }
    } catch (ex) {
        res.send(ex)
    }
};

module.exports.Login = async (req, res) => {
    try {
        const {email, password} = req.body;
        const p_user = await User.findOne({email: email});
        if (p_user) {
            if (to_Decrypt(p_user.password) === password) {
                const token = jwt.sign(
                    { user_id: p_user._id, ...p_user},
                    secret_key,
                    {
                        expiresIn: "2h",
                    }
                );
                await User.findOneAndUpdate({_id:p_user._id}, {status: true});
                res.status(200).send({success: true,token:token});
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
        const user = await User.findOne({ email });
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
        const user = await User.find({ _id:  req.params.id  });
        if(user && user.length){
            res.status(200).send({success: true,msg:"User Found",data:user[0]});
        }
        else {
            res.status(404).send({success: false,msg:"User Not Found",data:null});
        }
        //     .select([
        //     "email",
        //     "name",
        //     "profile",
        //     "_id",
        //     "contact",
        //     "gender",
        //     "hobby"
        // ]);
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
