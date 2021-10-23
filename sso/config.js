const fs = require("fs");
const path = require("path");

const {
    ISSUER,
    JWT_PRIVATE_KEY,
} = process.env;

const privateCert =
    JWT_PRIVATE_KEY.replace(/\\n/g, '\n') ||
    fs.readFileSync(path.resolve(__dirname, "./jwtPrivate.key"));

module.exports = {
    ISSUER,
    privateCert,
}