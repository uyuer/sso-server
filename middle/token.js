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

module.exports = {
    gatherToken,
    authToken,
}