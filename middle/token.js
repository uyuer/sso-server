const sso = require('../sso');

// 收集token
const gatherToken = async (ctx, next) => {
    let params = Object.assign({}, ctx.request.query, ctx.request.body);
    ctx.header.authorization = ctx.header.authorization || params.token || ''
    await next();
}

// 验证失败将会抛出错误
const authToken = async (ctx, next) => {
    return await next().catch(error => {
        if (401 == error.status) {
            ctx.throw(401, error.message)
        } else {
            ctx.throw(500, 'token认证失败');
        }
    });
}

const setSessionWithToken = async (ctx, next) => {
    let reg = new RegExp(`^\/api/`);
    // 以/api/开头的
    if (reg.test(ctx.request.path)) {
        let authorization = ctx.header.authorization;
        let [, token] = authorization ? authorization.match(/^Bearer\s(.+)$/) : null
        if (!token) {
            return ctx.throw(401, '未登陆');
        }
        try {
            let decoded = await sso.jwtVerify.verifyJwtToken(token);
            ctx.session.user = decoded;
        } catch (error) {
            return ctx.app.emit('error', error, ctx)
        }
    }
    await next(ctx);
}

module.exports = {
    gatherToken,
    authToken,
    setSessionWithToken,
}