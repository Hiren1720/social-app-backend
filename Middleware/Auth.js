const User = require('../Models/User');
const jwt = require("jsonwebtoken");
const secret_key = process.env.SECRET_KEY;

const verifyToken = async (req, res, next) => {
    const token = req.headers["authorization"];
    let withoutBearer = token.substring(7, token.length);
    if (!withoutBearer) {
        return res.status(403).send("A token is required for authentication");
    }
    try {
        const decoded = jwt.verify(withoutBearer, secret_key);
        let user = await User.findOne({_id:decoded._id})
        if(user){
            req.user = decoded;
        }else{
            return res.status(401).send({msg:"Invalid Token",err:'err'});
        }
    } catch (err) {
        return res.status(401).send({msg:"Invalid Token",err:err});
    }
    return next();
};

module.exports = verifyToken;