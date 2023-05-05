const jwt = require('jsonwebtoken');

const generateTokens = async (user) => {
    try {
        const accessToken = jwt.sign(
            {email:user?.email},
            process.env.SECRET_KEY,
            { expiresIn: "1d" }
        );
        const refreshToken = jwt.sign(
            {email:user?.email},
            process.env.SECRET_KEY,
            { expiresIn: "30d" }
        );
        return { accessToken, refreshToken };
    } catch (err) {
        return err;
    }
};
verifyRefreshToken = (refreshToken) => {
    return new Promise((resolve, reject) => {
        jwt.verify(refreshToken, process.env.SECRET_KEY, (err, tokenDetails) => {
            if (err)
                return reject({ error: true, message: "Invalid refresh token" });
            resolve({
                tokenDetails,
                error: false,
                message: "Valid refresh token",
            });
        });
    });
};
module.exports = {generateTokens,verifyRefreshToken};