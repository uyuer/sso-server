const db = require('./sequelize');
const { Client } = db.models;

const AUTH_HEADER = "authorization";
const BEARER_AUTH_SCHEME = "bearer";

let getClients = async function () {
	console.log(Client, db.models)
	let clients = await Client.findAll({
		where: { allowe: 1 },
		raw: true
	})
	const appClients = clients.reduce((total, item) => {
		total.appTokenDB[item.name] = item.token;
		total.originAppName[item.origin] = item.name;
		total.alloweOrigin[item.origin] = true;
		return total;
	}, {
		clients,
		appTokenDB: {},
		originAppName: {},
		alloweOrigin: {},
		AUTH_HEADER,
		BEARER_AUTH_SCHEME,
	})
	return appClients;
}
module.exports = getClients;
