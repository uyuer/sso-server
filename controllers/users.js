const jsonwebtoken = require('jsonwebtoken');
const dayjs = require('dayjs');

const { sendEmailCode } = require('../lib/email')
const db = require('../lib/sequelize');
const config = require('../config');

const pathName = '用户';
const pathRoute = 'ordinary';
const rules = {
	username: [{ required: true, message: "用户名不可为空" }, { pattern: /^[\u4E00-\u9FA5A-Za-z0-9]{2,20}$/, message: "用户名由2~20位中文、英文、数字和下划线字符组成" }],
	password: [{ required: true, message: "密码不可为空" }],
	repassword: [{ required: true, message: "重复密码不可为空" }],
	male: [{ required: false, message: "" }, { pattern: /[012]/, message: "性别参数错误" }],
	email: [{ required: true, message: "邮箱不可为空", }, { pattern: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/, message: "邮箱格式错误" }],
	code: [{ required: true, message: "验证码不可为空" }, { pattern: /^\d{4}$/, message: "验证码输入错误" }]
}
exports.verifyLogined = async (ctx) => {

}
// 用户登录
exports.login = async (ctx) => {
	console.log(`请求->${pathName}->登录: ${pathRoute}.login; method: ${ctx.request.method}; url: ${ctx.request.url} `);
	// TODO:是否记录用户操作记录
	// TODO:是否设置登录频繁操作的验证
	let params = ctx.verifyParams({
		username: rules.username,
		password: rules.password,
	});
	let { redirectUrl } = ctx.request.param;
	if (!redirectUrl) {
		return ctx.throw(400, '没有重定向地址')
	}
	let { username, password } = params;
	let { user } = db.models;
	let consumer = await user.findOne({ where: { username }, raw: true, });
	if (!consumer) {
		return ctx.throw(400, '用户不存在')
	}
	if (consumer.password !== password)
		return ctx.throw(400, '密码错误')
	let userinfo = { userId: consumer.id, username: consumer.username, email: consumer.email }
	let token = jsonwebtoken.sign(
		userinfo,  // 加密userToken
		config.SECRET, // 加密密钥
		{ expiresIn: '7d' } // 过期时间
	)
	ctx.session.userinfo = userinfo;
	ctx.session.logined = true;
	return ctx.redirect(`http://${redirectUrl}?ssoToken=${token}`)
};
// 发送邮件验证码
exports.sendregcode = async (ctx) => {
	console.log(`请求->${pathName}->发送邮箱: ${pathRoute}.sendregcode; method: ${ctx.request.method}; url: ${ctx.request.url} `);
	let params = ctx.verifyParams({
		email: rules.email,
	})
	const { email } = params;
	let { user, captcha } = db.models;
	// 检查是否频繁操作, 将用户操作计入session;
	// 检查用户是否间隔六十秒
	let { sendTime = '', count = 0 } = ctx.session.emailBehavior || {};
	if (sendTime && dayjs(sendTime).isAfter(dayjs().subtract(60, 'second'))) {
		return ctx.throw(400, '操作频繁');
	} else {
		count <= 0 ? count-- : count = 0;
	}
	// 检查邮箱是否已经注册过
	let emailBeUsed = await user.findOne({ where: { email } });
	if (emailBeUsed) {
		return ctx.throw(400, '此邮箱已被使用');
	}
	// 发送验证码
	let code = Math.random().toString().slice(2, 6); // 随机生成的验证码
	let sendResult = await sendEmailCode(email, code);
	// 发送完成后,记录状态到session
	let currentTime = dayjs();
	count++;
	ctx.session.emailBehavior = { sendTime: currentTime.valueOf(), sendTimeFormat: currentTime.format(), count }
	// 记录验证码到数据库
	let expires = currentTime.add(30, 'minute');
	let result = await captcha.create({
		email,
		code,
		expires: expires.valueOf(),
		expiresTime: expires.format()
	})
	ctx.body = result ? true : false;
};

// 用户注册
exports.register = async (ctx) => {
	console.log(`请求->${pathName}->注册: ${pathRoute}.register; method: ${ctx.request.method}; url: ${ctx.request.url} `);
	let params = ctx.verifyParams({
		email: rules.email,
		username: rules.username,
		password: rules.password,
		repassword: rules.repassword,
		male: rules.male,
		code: rules.code,
	})
	let { email, username, password, repassword, male, code } = params;
	let { user, captcha } = db.models;
	let emailBeUsed = await user.findOne({ where: { email } });
	if (emailBeUsed)
		return ctx.throw(400, '此邮箱已被使用');
	// 检查用户名是否被使用
	let usernameBeUsed = await user.findOne({ where: { username } });
	if (usernameBeUsed)
		return ctx.throw(400, '此用户名已被使用');
	// 校验用户两次输入密码是否一致
	if (password !== repassword)
		return ctx.throw(400, '两次输入密码不一致');
	// 检查邮箱验证码是否存在
	let regEmail = await captcha.findOne({
		attributes: ['id', 'email', 'code', 'expires', 'expiresTime'],
		where: { email, code },
		order: [['createdAt', 'DESC']],
		raw: true,
	});
	if (!regEmail)
		return ctx.throw(400, '验证码错误');
	if (dayjs().isAfter(dayjs(regEmail.expires)))
		return ctx.throw(400, '验证码已过期, 请重新获取');
	await user.create({
		email: params.email,
		username: params.username,
		password: params.password,
		male: params.male,
	})
	await captcha.destroy({
		where: { email }
	});
	ctx.body = true;
};
