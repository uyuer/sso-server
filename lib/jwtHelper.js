const jwt = require("jsonwebtoken");
const { sso, session } = require("../config");
const { privateCert, ISSUER } = sso;
const { EXPIRE_TIME } = session;

const genJwtToken = payload =>
	new Promise((resolve, reject) => {
		jwt.sign(
			{ ...payload },
			privateCert,
			{
				algorithm: "RS256",
				expiresIn: Number(EXPIRE_TIME) / 3600 + "h",
				issuer: ISSUER
			},
			(err, token) => {
				if (err) return reject(err);
				return resolve(token);
			}
		);
	});

module.exports = Object.assign({}, { genJwtToken });