const router = require('koa-router')();
const controllers = require('../controllers');

const routes = {
	'post /sso/verifytoken': { handler: controllers.sso.verifytoken },
	'post /sso/doLogin': { handler: controllers.sso.doLogin },
	'post /sso/login': { handler: controllers.sso.login },
	'post /sso/logout': { handler: controllers.sso.logout },
	'post /sso/view': { handler: controllers.sso.view },
	'post /sso/clear': { handler: controllers.sso.clear },
}
for (let key in routes) {
	let [method, path] = key.split(' ');
	let { middle, handler } = routes[key];
	let params = middle ? [middle, handler] : [handler];
	router[method](path, ...params)
}
module.exports = router;