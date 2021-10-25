const router = require('koa-router')();
const controllers = require('../controllers');
const { authenticate } = require("../sso");

const {
	sessionUser,
	sessionApp,
	intrmTokenCache,
	deleteApplicationInCache,
	storeApplicationInCache,
} = require('../sso/data');

const view = async (ctx, next) => {
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
const clear = async (ctx, next) => {
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

const routes = {
	'post /sso/user/verifytoken': { handler: controllers.user.verifytoken },
	'post /sso/user/doLogin': { handler: controllers.user.doLogin },
	'post /sso/user/login': { handler: controllers.user.login },
	'post /sso/user/logout': { handler: controllers.user.logout },
	'post /sso/user/view': { handler: view },
	'post /sso/user/clear': { handler: clear },
}
for (let key in routes) {
	let [method, path] = key.split(' ');
	let { middle, handler } = routes[key];
	let params = middle ? [middle, handler] : [handler];
	router[method](path, ...params)
}
module.exports = router;