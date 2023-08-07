const nodeMailer = require('nodemailer');
// const multer = require('multer');
require('dotenv').config();
let user_email = process.env.USER_EMAIL;
let user_name = process.env.USER_NAME;
let user_pass = process.env.USER_PASS;
const minutesDiff = (date1, date2) => {
    let diffMin =(date2.getTime() - date1.getTime()) / 1000;
    diffMin /= 60;
    return Math.abs(Math.round( diffMin ));
}

const transporter = nodeMailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: true,
    auth: {
        user: user_email,
        pass: user_pass
    }
});

const SendMail = async ({user,subject,text = '',html = `<></>`}) => {
    return await new Promise((resolve, reject) => {
        transporter.sendMail({
            from: {
                name: user_name,
                address: user_email,
            },
            to: user?.email,
            subject: subject,
            text: text,
            html: html,
        },(err, info) => {
            if (err) {
                reject(err);
            } else {
                resolve(info);
            }
        });
    })
}

// const storageEngine = (path)=> multer.diskStorage({
//     destination: "./Photos/" + path,
//     filename: (req, file, cb) => {
//         cb(null, file.originalname);
//     },
// })


const connectedClients = new Map();

const passData = (data, event) => {
    for (const client of connectedClients.values()) {
        client.res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    }
};

module.exports = {passData, connectedClients, storageEngine, SendMail, minutesDiff};

