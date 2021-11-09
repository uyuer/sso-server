const fs = require("fs");
const path = require("path");

const {
    ISSUER,
    JWT_PRIVATE_KEY,
} = process.env;

const privateCert ='1234'; // fs.readFileSync(path.resolve(__dirname, "../jwtPrivate.key"));// JWT_PRIVATE_KEY.replace(/\\n/g, '\n') || fs.readFileSync(path.resolve(__dirname, "../jwtPrivate.key"));

module.exports = {
    ISSUER,
    privateCert,
}