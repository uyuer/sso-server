const router = require('koa-router')()
const { v4: uuidv4 } = require('uuid');
const Hashids = require("hashids");
const URL = require("url").URL;

const db = require('../lib/sequelize');
const getClients = require('../lib/getClients');
const { genJwtToken } = require('../sso/jwtHelper');
const rules = require('../config/rules');

const controllers = require("../controllers");

// const http = require("../lib/http");
const axios = require("axios");

const hashids = new Hashids();
const deHyphenatedUUID = () => uuidv4().replace(/-/gi, "");
const encodedId = () => hashids.encodeHex(deHyphenatedUUID());

let sessionUser = {};
let sessionApp = {};
let intrmTokenCache = {};

async function deleteApplicationInCache(intrmid) {
	delete intrmTokenCache[intrmid];
}
async function storeApplicationInCache(id, serviceURL) {
	let { originAppName } = await getClients();
	/* 
		记录用户登录的客户端应用:
		sessionApp = {
			Ny2Ep0zG4MSkgZKPx18LUmm9pZkD: {
				sso_mine:true
			}
		} 
	*/
	const origin = new URL(serviceURL).origin;
	if (sessionApp[id] == null) {
		sessionApp[id] = {}
	}
	sessionApp[id][originAppName[origin]] = true;
	/*
		用新的id来保存用户的
		intrmTokenCache = {
			PkAZX7nWRGi19o19mBzzi4Q8wkk: ['Ny2Ep0zG4MSkgZKPx18LUmm9pZkD', 'sso_mine']
		}
	*/
	const intrmid = encodedId();
	intrmTokenCache[intrmid] = [id, originAppName[origin]];
	return intrmid;
}

const verifytoken = async (ctx, next) => {
	console.log('用户信息', ctx.session)
	let { appTokenDB, AUTH_HEADER, BEARER_AUTH_SCHEME } = await getClients();
	let headerToken = ctx.request.headers[AUTH_HEADER];
	let matches = headerToken ? headerToken.match(/(\S+)\s+(\S+)/) : [];
	let [, scheme, appToken] = matches;
	let { ssoToken } = ctx.request.body;
	console.log(
		BEARER_AUTH_SCHEME != (scheme || '').toLowerCase(),
		appToken == null,
		ssoToken == null,
		intrmTokenCache[ssoToken] == null,
		intrmTokenCache,
		ssoToken,
	)
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
	console.log(
		appToken !== appTokenDB[appName],
		sessionApp[globalSessionToken][appName] !== true,
		sessionUser[globalSessionToken] == null,
		sessionUser,
		globalSessionToken,
	)
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
}
const doLogin = async (ctx, next) => {
	console.log('页面初始化,判断用户是否登录', ctx.session)
	let { alloweOrigin } = await getClients();
	const { serviceURL } = ctx.request.body;
	// 判断来源地址是否是子系统
	if (serviceURL) {
		const origin = new URL(serviceURL).origin;
		if (alloweOrigin[origin] !== true) {
			return ctx.throw(400, "Your are not allowed to access the sso-server")
		}
	}
	// 如果session中有登录信息,但是没有重定向地址时
	if (ctx.session.user != null && serviceURL == null) {
		console.log('session.user信息:', ctx.session.user)
		return ctx.body = '';
	}
	// 如果session中没有登录信息,并且存在重定向地址时
	if (ctx.session.user != null && serviceURL != null) {
		console.log('session.user信息:', ctx.session.user)
		const origin = new URL(serviceURL).origin;
		let id = ctx.session.user;
		let intrmid = await storeApplicationInCache(id, serviceURL);
		return ctx.body = `${serviceURL}?ssoToken=${intrmid}`
	}
	return ctx.body = '';
}
const login = async (ctx, next) => {
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
		return ctx.body = `${ctx.protocol}://${ctx.headers.host}`;
	}
	// 将当前用户的id,和跳转应用保存下来,并返回对应的验证ssoToken:intrmid
	let intrmid = await storeApplicationInCache(id, serviceURL);
	const origin = new URL(serviceURL).origin;
	console.log(id, intrmid, ctx.session.user)
	console.log(id)
	console.log(sessionUser)
	console.log(sessionApp)
	ctx.cookies.set('ssoid', id, { signed: true, domain: '.uyue.club' });
	return ctx.body = `${serviceURL}?ssoToken=${intrmid}`;
}
const logout = async (ctx, next) => {
	const { globalSessionID } = ctx.request.body;
	let userId = ctx.session.user;
	let id = userId || globalSessionID;

	console.log(id)
	console.log(userId)
	console.log(globalSessionID)
	console.log(sessionUser, sessionUser[id])
	console.log(sessionApp, sessionApp[id])

	if (sessionUser[id]) {
		console.log('删除sessionUser ' + id)
		delete sessionUser[id];
	}
	if (sessionApp[id]) {
		console.log('删除sessionApp ' + id)
		delete sessionApp[id];
	}
	console.log(sessionUser)
	console.log(sessionApp)
	ctx.session = null;
	ctx.body = true;

}

router.post('/sso/user/verifytoken', verifytoken)
router.post('/sso/user/doLogin', doLogin)
router.post('/sso/user/login', login)
router.post('/sso/user/logout', logout)
router.post('/sso/user/view', async (ctx, next) => {
	console.log(ctx.cookies.get('ssoid'))
	let user = ctx.session.user;
	let info = {
		user: user || null,
		sessionUser,
		sessionApp,
		intrmTokenCache,
	}
	ctx.body = info;
})
router.post('/sso/user/clear', async (ctx, next) => {
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
})

router.post('/sso/user/view', async (ctx, next) => {
	console.log(ctx.session)
	console.log('111111111111111start-start-start-start')
	console.log('ctx.session.user', ctx.session?.user)
	console.log('------------')
	console.log('sessionUser', sessionUser)
	console.log('------------')
	console.log('sessionApp', sessionApp)
	console.log('------------')
	console.log('intrmTokenCache', intrmTokenCache)
	console.log('11111111111111end-end-end-end')
	ctx.body = true;
})
// router.get('/login', controllers.page.login)

router.get('/clear', async (ctx, next) => {
	console.log('111111111111111start-start-start-start')
	console.log('ctx.session.user', ctx.session?.user)
	console.log('------------')
	console.log('sessionUser', sessionUser)
	console.log('------------')
	console.log('sessionApp', sessionApp)
	console.log('------------')
	console.log('intrmTokenCache', intrmTokenCache)
	console.log('11111111111111end-end-end-end')
	return ctx.render("clear", {
		title: "SSO-Server | clear"
	});
})
module.exports = router;