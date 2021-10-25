const koaSession = require("koa-session"); // 导入koa-session
const { session } = require('../config');

const setKoaSession = function (app) {
    app.keys = [session.SESSION_KEY];
    app.on('session:expired', (key, value, ctx) => console.log(key));
    return koaSession({
        ...session.config,
    }, app)
}

module.exports = setKoaSession;