const nodeMailer = require('nodemailer');
require('dotenv').config();
let user_email = process.env.USER_EMAIL;
let user_pass = process.env.USER_PASS;
module.exports.minutesDiff = (date1, date2) => {
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

module.exports.SendMail = async ({user,subject,text = '',html = `<></>`}) => {
    return await transporter.sendMail({
        from: user_email,
        to: user?.email,
        subject: subject,
        text: text,
        html: html,
    });
}