const db = require('./sequelize');
const { Client } = db.models;

let getClients = async function () {
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
	})
	return appClients;
}
module.exports = {
	getClients,
};
