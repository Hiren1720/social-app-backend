const Comment = require("../Models/Comment");
const Post = require("../Models/Post");
const User = require("../Models/User");

module.exports.createCommentOnPost = async (req, res) => {
    try {
        let comment = new Comment(req.body);
        comment.save(async function (error, document) {
            if (error) {
                res.status(400).send({success: false, msg: "Request Failed", data: error});
            } else {
                if(document?.postId){
                    await Post.findOneAndUpdate({_id:document?.postId}, { $push: { "comments": document?._id } });
                }
                res.status(201).send({success: true, msg: "Comment Added", data: document});
            }
        });
    } catch (ex) {

    }
};
module.exports.getCommentsById = async (req, res) => {
    try {
        let comments = await Comment.find({postId:req.params.id}).sort({createdAt:-1});
        if(comments && comments.length){
            let result = comments.map(async (ele)=>{
                let user = await User.findOne({_id:ele?.createdBy});
                ele.user = user
                return ele;
            });
            res.status(200).send({success: true, msg: "", data: await Promise.all(result)});
        }
        else{
            res.status(400).send({success: false, msg: "", data: null});
        }
    } catch (ex) {
        res.status(400).send({success: false, msg: "", error: ex});
    }
};
// module.exports.getAllLikes = async (req, res) => {
//     try {
//         let users = await User.find({
//             '_id': { $in: req?.body}
//         });
//         if(users && users.length){
//             res.status(200).send({success: true, msg: "", data: users});
//         }
//         else{
//             res.status(400).send({success: false, msg: "", data: null});
//         }
//     } catch (ex) {
//         res.status(400).send({success: false, msg: "", error: ex});
//     }
// };

