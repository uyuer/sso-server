const config = require('./config');
const jwtHelper = require('./jwtHelper');

module.exports = {
    config,
    jwtHelper, // 验证解析返回的token
}