const nodemailer = require('nodemailer')
const config = require('../config');
const { E_MAIL, E_PASS, CODEVALIDTIME } = config.email;

const emailOptions = {
    service: 'qq', // 使用了内置传输发送邮件 查看支持列表：https://nodemailer.com/smtp/well-known/
    port: 465, // SMTP 端口
    secureConnection: true, // 使用了 SSL
    auth: {
        user: E_MAIL,
        pass: E_PASS,  //这个是开启`POP3/SMTP/IMAP`的授权码
    }
};
const transporter = nodemailer.createTransport(emailOptions);

const curring = function (option) {
    return function (op) {
        let mailOptions = {
            ...option,
            ...op,
        }
        return transporter.sendMail(mailOptions)
    }
}
const sendMail = curring({
    from: E_MAIL,
    cc: E_MAIL,
})
const sendRegistrationEmail = function (to, code) {
    if (!to || !code) {
        return Promise.reject({ message: '邮箱和验证码不能为空' })
    }
    sendMail({
        to: to, // 目标邮箱
        subject: `电子邮件验证码：${code}`,
        text: '用户注册',
        html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>邮箱验证</title>
            </head>
            <body>
                <div class="container" align="center" style="border-style: solid;border-width: thin;border-color: #dadce0;border-radius: 8px;padding: 40px 20px;max-width: 500px;margin: 0 auto;">
                    <img src="https://www.gstatic.com/images/branding/googlelogo/2x/googlelogo_color_74x24dp.png" width="74" height="24" aria-hidden="true" class="logo" style="margin-bottom: 16px;">
                    <div class="content" style="font-size: 14px;color: rgba(0, 0, 0, 0.87);text-align: left;">
                        <div class="desc title" style="margin-bottom: 22px;font-size: 24px;text-align: center;">请验证您的邮箱 </div>
                        <div class="desc" style="margin-bottom: 16px;">幽钥的小站收到了使用 <b><a style="color: inherit;">1064926209@qq.com</a></b> 用于注册的请求。 </div>
                        <div class="desc" style="margin-bottom: 16px;">请使用此验证码在网页中填写，完成邮箱验证：</div>
                        <div class="desc code green" style="margin-bottom: 16px;text-align: center;font-size: 36px;line-height: 44px;color: #9CCC65;">${code}</div>
                        <div class="desc" style="margin-bottom: 16px;">此验证码将在 <b class="orange" style="color: #FF9800;">${CODEVALIDTIME/60}分钟</b> 后失效。</div>
                        <div class="desc" style="margin-bottom: 16px;">如果您没有做过此操作，可以放心地忽略这封电子邮件。</div>
                        <div class="desc blue" style="margin-bottom: 16px;color: #00BCD4;"><a href="uyue.club" style="color: inherit;">幽钥的小站</a></div>
                        <div class="desc blue" style="margin-bottom: 16px;color: #00BCD4;">2016年03月08日 星期二</div>
                    </div>
                </div>
            </body>
            </html>
        `
    })
}

exports.transporter = transporter;
exports.sendMail = sendMail;
exports.sendRegistrationEmail = sendRegistrationEmail;