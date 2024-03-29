const Post = require("../Models/Post");
const User = require("../Models/User");
const mongoose = require("mongoose");
const {passData} = require('../Utils/helper')
var cloudinary = require('cloudinary').v2;

// Change cloud name, API Key, and API Secret below

cloudinary.config({
    cloud_name: 'socialposts',
    api_key: "169658132968456",//'',112233754916731
    api_secret: "ay01j7l33tC4gd_K8-5AK30agDk",//'ay01j7l33tC4gd_K8-5AK30agDk'2iZyG2_uhc3QVfi2wK3qViQzmwE
});

// Change 'sample' to any public ID of your choice



module.exports.deleteFromCloudinary = async (req,res) => {
    try{
        const {public_id} = req.body;
        await cloudinary.uploader.destroy(public_id, function(error,data) {
            if(data.result === 'ok'){
                res.send({success:'',})
            }
        });

    }
    catch (e) {

    }
}
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
        createdBy:1,
        content:1,
        createdAt:1,
        likes:1,
        comments:1,
        title:1,
        hashTags:1,
        device:1,
        mentions:1,
        imageUrl:1,
        savedBy:1,
    }
};
const getPaginationObj = ({page,pageSize}) => {
    return {'$facet': {
            data: [ { $skip: parseInt(page) * parseInt(pageSize) }, { $limit: parseInt(pageSize) } ],
            total:  [{ $count: "total" }]
        }}
};

// const postResponse = (post,res) => {
//     if(post && post.length && post[0]?.data?.length && post[0]?.total?.length){
//         res.status(200).send({success: true, msg: "", data: post[0]?.data,total: post[0]?.total[0]?.total});
//     }
//     else{
//         res.status(200).send({success: false, msg: "", data: [],total:null});
//     }
// }

const postResponse = async (post,res) => {
    if(post && post.length && post[0]?.data?.length && post[0]?.total?.length){
        let postData = post[0]?.data?.map(async (ele)=> {
            let likedAllData =  ele?.likes?.slice(-5)?.map(async (liked)=>{
                let user = await User.find({_id: mongoose.Types.ObjectId(liked)});
                return  {_id:user[0]?._id, profile_url:user[0]?.profile_url, userName:user[0]?.userName}
            })
            return {...ele, likedData:await Promise.all(likedAllData)}
        });
        let posts = await Promise.all(postData);
        // console.log("posts----", posts, "post[0]?.data====",post[0]?.data)
        // console.log("data: post[0]?.data",post[0]?.data, "post-------likes", post[0]?.data?.likes)
        // res.status(200).send({success: true, msg: "", data: post[0]?.data,total: post[0]?.total[0]?.total});
        res.status(200).send({success: true, msg: "", data: posts,total: post[0]?.total[0]?.total});
    }
    else{
        res.status(200).send({success: false, msg: "", data: [],total:null});
    }
}
module.exports.createPost = async (req, res) => {
    try {
        let post = new Post(req.body);
        post.save(function (error, document) {
            if (error) {
                res.status(400).send({success: false, msg: "Request Failed", data: error});
            } else {
                // passData('Please Refresh and See new post ', 'post')
                res.status(201).send({success: true, msg: "Post Created", data: document});
            }
        });
    } catch (ex) {

    }
};


module.exports.updatePost = async (req, res) => {
    try {
        // let data = JSON.parse(req.body?.post);
        let data = req.body;
        // console.log("Req", req.body, "data---------------", data)
        let image = [];
        // if(req?.files?.length > 0){
        //      image = req?.files.map(ele => {return {type:ele.mimetype.split('/')[0],url:`/Posts/${ele?.filename}`}})
        // }
        // const filteredArray = data?.imageUrl.filter(obj => Object.keys(obj).length !== 0);
        // image.push(...filteredArray);

        // let postData = await Post.findOneAndUpdate({_id:data._id}, {...data,imageUrl:[...image]}).lean();
        let postData = await Post.findOneAndUpdate({_id:data._id}, {...data}).lean();
        if (postData) {
            return res.status(201).send({success: true, msg: "Post Updated Successfully",data:'document'});
        } else {
            return res.status(400).send({success: false, msg: "Post Update Failed", data: null});
        }
    } catch (ex) {
        res.send(ex);
    }
};
module.exports.getAllPost = async (req, res) => {
    try {
        let post = await Post.aggregate([
            {...lookupForUsers('users','createdBy','_id','author_info')},
            {...projectForPost},
            {$sort:{createdAt : -1}},
            {...getPaginationObj(req?.query)}
        ])
        return postResponse(post,res);
    } catch (ex) {
        res.status(400).send({success: false, msg: "", error: ex});
    }
};

module.exports.getMentionPosts = async (req, res) => {
    try {
        let {id} = req?.params;
        let post = await Post.aggregate([
            {
                $match : {
                    mentions : {
                        $elemMatch : {
                            $and : [
                                { id : id }
                            ]
                        }
                    },
                }
            },
        ]);
        if(post && post.length){
            res.status(200).send({success: true, msg: "", data: post});
        }
        else{
            res.status(400).send({success: false, msg: "Something went wrong!", data: null});
        }
    } catch (ex) {
        res.status(400).send({success: false, msg: "", error: ex});
    }
};

module.exports.deletePost = async  (req, res)=>{
    try{
        if (!req.params.id) {
            return res.status(400).send({ msg: "Post id is required " });
        }
        else {
            let post = await Post.deleteOne({_id:req.params.id})
            if(post){
                return res.status(200).send({success: true,msg:"Post Deleted Successfully",});
            }
            else{
                return res.status(400).send({success: false,msg:"failed",});
            }
        }
    } catch (ex) {
        res.send(ex);
    }
}
module.exports.getAllLikes = async (req, res) => {
    try {
        let {id} = req?.query;
        let likes = await Post.aggregate([
            {$match:{_id: mongoose.Types.ObjectId(id)}},
            {...lookupForUsers('users','likes','_id','likedUsers')},
            {
                $project: {
                    likedUsers: {
                        _id:1,
                        name: 1,
                        userName: 1,
                        profile_url: 1
                    },
                }
            }
        ]);
        if(likes?.length && likes[0]?.likedUsers?.length){
            res.status(200).send({success: true, msg: "", data: likes[0]?.likedUsers});
        }
        else{
            res.status(400).send({success: false, msg: "Something went wrong!", data: null});
        }
    } catch (ex) {
        res.status(400).send({success: false, msg: "Something went wrong!", error: ex});
    }
};
// module.exports.postLike = async (req, res) => {
//     try {
//         let data = req?.body;
//         let post = await Post.findOne({_id: mongoose.Types.ObjectId(data?.postId)}).lean();
//         if (post) {
//             if (post.likes.some(objId => objId.equals(data?.likeBy))) {
//                 let newPost = await Post.findOneAndUpdate({_id: data?.postId}, {$pull: {"likes": mongoose.Types.ObjectId(data?.likeBy)}},{new:true}).lean();
//                 passData(newPost,'likes');
//                 res.status(200).send({success: true, msg: "disliked", data: document});
//             } else {
//                 let updatedPost = await Post.findOneAndUpdate({_id: data?.postId}, {$push: {"likes": mongoose.Types.ObjectId(data?.likeBy)}},{new:true}).lean();
//                 passData(updatedPost,'likes');
//                 res.status(200).send({success: true, msg: "liked", data: document});
//             }
//         }
//         else {
//             res.status(400).send({success: false, msg: "Something went wrong!", data: null});
//         }
//     } catch (ex) {
//         res.send(ex);
//     }
// };
module.exports.postLike = async (datas) => {
    try {
        let data = datas?.body;
        let post = await Post.findOne({_id: mongoose.Types.ObjectId(data?.postId)}).lean();
        if (post) {
            console.log("post", post)
            if (post.likes.some(objId => objId.equals(data?.likeBy))) {
                let newPost = await Post.findOneAndUpdate({_id: data?.postId}, {$pull: {"likes": mongoose.Types.ObjectId(data?.likeBy)}},{new:true}).lean();
                // passData(newPost,'likes');
                console.log("dislike")
                return {success: true, msg: "disliked", data: newPost}
                // res.status(200).send({success: true, msg: "disliked", data: document});
            } else {
                let updatedPost = await Post.findOneAndUpdate({_id: data?.postId}, {$push: {"likes": mongoose.Types.ObjectId(data?.likeBy)}},{new:true}).lean();
                // passData(updatedPost,'likes');
                console.log("like")
                return {success: true, msg: "liked", data: updatedPost}
                // res.status(200).send({success: true, msg: "liked", data: document});
            }
        }
        else {
            return {success: false, msg: "Something went wrong!", data: null}
            // res.status(400).send({success: false, msg: "Something went wrong!", data: null});
        }
    } catch (ex) {
        // res.send(ex);
    }
};
module.exports.getPost = async (req, res) => {
    try {
        let {postId} = req.query;
        let post = await Post.aggregate([
            {$match:{_id: mongoose.Types.ObjectId(postId)}},
            {...lookupForUsers('users','createdBy','_id','author_info')},
            {...projectForPost},
        ])
        if(post){
            res.status(200).send({success: true, msg: "Success", data: post});
        }
        else{
            res.status(400).send({success: false, msg: "Something went wrong!", data:null});
        }
    } catch (ex) {

    }
};

module.exports.savePost = async (req, res) => {
    try {
        let {id} = req.body;
        let {_id} = req.user;
        const post = await Post.findOne({_id: id}).lean();
        if (post) {
            if(post.savedBy.some(objId => objId.equals(req.user._id))){
                await Post.findOneAndUpdate({_id:id},{$pull:{savedBy:mongoose.Types.ObjectId(_id)}});
                res.status(200).send({success: true, msg: "Unsaved"});
            }else{
                await Post.findOneAndUpdate({_id:id},{$push:{savedBy:mongoose.Types.ObjectId(_id)}});
                res.status(200).send({success: true, msg: "Saved"});
            }
        } else {
            res.status(404).send({success: false, msg: "Failed"});
        }
    } catch (ex) {
        res.send(ex);
    }
};

module.exports.getSavedPost = async (req, res) => {
    try {
        let post = await Post.aggregate([
            {
                $match : {
                    savedBy : {
                        $elemMatch : {
                            $eq :mongoose.Types.ObjectId(req.user._id)
                        }
                    },
                }
            },
            {...lookupForUsers('users','createdBy','_id','author_info')},
            {...projectForPost},
            {$sort:{createdAt : -1}},
            {...getPaginationObj(req?.query)}
        ]).sort({createdAt:-1})
        return postResponse(post,res);
    } catch (e) {
        res.send(e);
    }
}
module.exports.getPostByUserId = async (req,res) => {
    try {
        let post = await Post.aggregate([
            {
                $match : {
                    createdBy : mongoose.Types.ObjectId(req.query.id)
                }
            },
            {...lookupForUsers('users','createdBy','_id','author_info')},
            {...projectForPost},
            {$sort:{createdAt : -1}},
            {...getPaginationObj(req?.query)}
        ]).sort({createdAt:-1});
        return postResponse(post,res);
    } catch (e) {
        res.send(e);
    }
}
