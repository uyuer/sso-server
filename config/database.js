require('dotenv').config({ path: '.env' });
const {
    DB_USERNAME, // 目标数据库用户名
    DB_PASSWORD, // 目标数据库密码
    DB_NAME, // 数据库名称
    DB_HOST, // 数据库地址
    DB_PORT, // 数据库端口
} = process.env;

module.exports = {
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_NAME,
    host: DB_HOST,
    port: DB_PORT,
}