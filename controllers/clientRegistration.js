const { Op } = require("sequelize");
const db = require('../lib/sequelize');
const rules = require('../config/rules');

const fn = async (ctx, next) => {
    ctx.sso.test['xxxxx'] = true;
    let params = ctx.verifyParams({
        name: rules.client.name,
        alias: rules.client.alias,
        token: rules.client.token,
        origin: rules.client.origin,
        allowe: rules.client.allowe,
        remark: rules.client.remark,
    });
    let { name, alias, token, origin } = params;
    let { Client } = db.models;
    let isExit = await Client.findAll({
        where: {
            [Op.or]: [
                { name },
                { alias },
                { token },
                { origin },
            ]
        },
        raw: true,
    });
    if (isExit.length) {
        return ctx.throw(400, '应用已存在不能重复注册')
    }
    let result = await Client.create(params)
    ctx.body = result;
}
module.exports = fn;