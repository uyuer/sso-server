const formatStatus = (status) => {
    return ['正常', '停用', '注销'][Number(status)]
}

module.exports = {
    formatStatus,
}