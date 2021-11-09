const URL = require("url").URL;
const dayjs = require('dayjs');

const rules = require('../config/rules');

const db = require('../lib/sequelize');
const encodedId = require('../lib/encodedId');
const { getClients } = require('../lib/dict');
const { genJwtToken } = require('../lib/jwtHelper');
const { sendEmailCode } = require('../lib/email')
const {
	sessionUser,
	sessionApp,
	intrmTokenCache,
	deleteApplicationInCache,
	storeApplicationInCache,
} = require('../data');

exports.verifytoken = async (ctx, next) => {
	try {
		const AUTH_HEADER = "authorization";
		const BEARER_AUTH_SCHEME = "bearer";
		let { appTokenDB } = await getClients();
		let headerToken = ctx.request.headers[AUTH_HEADER];
		let matches = headerToken ? headerToken.match(/(\S+)\s+(\S+)/) : [];
		let [, scheme, appToken] = matches;
		let { ssoToken } = ctx.request.body;
		if (
			BEARER_AUTH_SCHEME != (scheme || '').toLowerCase() ||
			appToken == null ||
			ssoToken == null ||
			intrmTokenCache[ssoToken] == null
		) {
			return ctx.throw(401, 'badRequest');
		}
		const globalSessionToken = intrmTokenCache[ssoToken][0];
		const appName = intrmTokenCache[ssoToken][1];
		if (
			appToken !== appTokenDB[appName] ||
			sessionApp[globalSessionToken][appName] !== true ||
			sessionUser[globalSessionToken] == null
		) {
			return ctx.throw(401, 'Unauthorized');
		}
		let payload = {
			...sessionUser[globalSessionToken],
			globalSessionID: globalSessionToken
		}
		let token = await genJwtToken(payload);
		await deleteApplicationInCache(ssoToken)
		// ctx.session.user = globalSessionToken;
		return ctx.body = { token };
	} catch (error) {
		console.log(error)
		return ctx.body = { token: '12312312' }
	}
}
exports.doLogin = async (ctx, next) => {
	let { alloweOrigin } = await getClients();
	const { serviceURL } = ctx.request.body;
	// 判断来源地址是否是子系统
	// TODO:这里有bug, 当没有serviceURL时会出现意外的错误
	if (serviceURL) {
		const origin = new URL(serviceURL).origin;
		if (alloweOrigin[origin] !== true) {
			return ctx.throw(400, "Your are not allowed to access the sso-server")
		}
	}
	// 如果session中有登录信息,但是没有重定向地址时
	if (ctx.session.user != null && serviceURL == null) {
		return ctx.body = '';
	}
	// 如果session中没有登录信息,并且存在重定向地址时
	if (
		ctx.session.user != null &&
		serviceURL != null &&
		sessionUser[ctx.session.user] != null &&
		sessionApp[ctx.session.user] != null
	) {
		const origin = new URL(serviceURL).origin;
		let id = ctx.session.user;
		let intrmid = await storeApplicationInCache(id, serviceURL);
		return ctx.body = `${serviceURL}?ssoToken=${intrmid}`
	} else {
		ctx.session = null;
	}
	return ctx.body = '';
}
exports.login = async (ctx, next) => {
	let params = ctx.verifyParams({
		username: rules.user.username,
		password: rules.user.password,
		serviceURL: rules.user.serviceURL,
	});
	let { username, password, serviceURL } = params;
	let { User } = db.models;
	let info = await User.findOne({
		attributes: ['id', 'email', 'username'],
		where: { username, password },
		raw: true,
	});
	if (!info) {
		return ctx.throw(400, '用户或密码错误')
	}
	const id = encodedId();
	ctx.session.user = id; // 使用一个id来标识用户,并在session中声明
	sessionUser[id] = info; // 将这个id与用户名以key:value的形势保存在全局变量中
	// 是否存在serviceURL, 没有携带跳转的地址时
	if (serviceURL == null) {
		return ctx.body = `http://uyue.club:9611`;
	}
	// 将当前用户的id,和跳转应用保存下来,并返回对应的验证ssoToken:intrmid
	let intrmid = await storeApplicationInCache(id, serviceURL);
	return ctx.body = `${serviceURL}?ssoToken=${intrmid}`;
}
exports.logout = async (ctx, next) => {
	const { globalSessionID } = ctx.request.body;
	let id = globalSessionID;
	if (sessionUser[id]) {
		delete sessionUser[id];
	}
	if (sessionApp[id]) {
		delete sessionApp[id];
	}
	ctx.session = null;
	ctx.body = true;
}
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

exports.view = async (ctx, next) => {
	console.log(ctx.cookies.get('ssoid'))
	let user = ctx.session.user;
	let info = {
		user: user || null,
		sessionUser,
		sessionApp,
		intrmTokenCache,
	}
	ctx.body = info;
}
exports.clear = async (ctx, next) => {
	ctx.session = null;
	sessionUser = {}
	sessionApp = {}
	intrmTokenCache = {}
	let info = {
		sessionUser,
		sessionApp,
		intrmTokenCache,
	}
	ctx.body = info;
}