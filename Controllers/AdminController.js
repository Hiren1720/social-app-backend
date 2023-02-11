const Admin = require("../Models/Admin");


module.exports.GetAll = async (req, res) => {
     try {
        const users = await Admin.find()
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

 module.exports.Register = async (req, res) => {
     try {
         const { email} = req.body;
         const user = await Admin.findOne({ email });
         if (user){
             return res.json({ msg: "User already exists", status: false });
         }else{
             let user = new Admin(req.body)
             user.save(function (error, document) {
                 if (error){
                     // console.error(error)
                     res.status(400).send({success: false,msg:"creation failed",data:error});
                 }
                 else {
                     res.status(201).send({success: true,msg:"successfully created",data:document});
                 }
             });
         }
     } catch (ex) {

     }
 };



 module.exports.getById = async (req, res) => {
     try {
        const user = await Admin.find({ _id:  req.params.id  })
         if(user && user.length){
             res.status(200).send({success: true,msg:"User Found",data:user});
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
         const userData = await Admin.findByIdAndUpdate(
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