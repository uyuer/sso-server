const encodedId = require('./lib/encodedId');
const { getClients } = require('./lib/dict');

let sessionUser = {};
let sessionApp = {};
let intrmTokenCache = {};

async function deleteApplicationInCache(intrmid) {
    delete intrmTokenCache[intrmid];
}
async function storeApplicationInCache(id, serviceURL) {
    let { originAppName } = await getClients();
    /* 
        记录用户登录的客户端应用:
        sessionApp = {
            Ny2Ep0zG4MSkgZKPx18LUmm9pZkD: {
                sso_mine:true
            }
        } 
    */
    const origin = new URL(serviceURL).origin;
    if (sessionApp[id] == null) {
        sessionApp[id] = {}
    }
    sessionApp[id][originAppName[origin]] = true;
    /*
        用新的id来保存用户的
        intrmTokenCache = {
            PkAZX7nWRGi19o19mBzzi4Q8wkk: ['Ny2Ep0zG4MSkgZKPx18LUmm9pZkD', 'sso_mine']
        }
    */
    const intrmid = encodedId();
    intrmTokenCache[intrmid] = [id, originAppName[origin]];
    return intrmid;
}

// TODO:这种方式感觉有问题啊
module.exports = {
    sessionUser,
    sessionApp,
    intrmTokenCache,
    deleteApplicationInCache,
    storeApplicationInCache,
}