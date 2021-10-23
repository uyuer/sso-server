
const rules = {
    user: {
        username: [{ required: true, message: "用户名不可为空" }, { pattern: /^[\u4E00-\u9FA5A-Za-z0-9]{2,20}$/, message: "用户名由2~20位中文、英文、数字和下划线字符组成" }],
        password: [{ required: true, message: "密码不可为空" }],
        repassword: [{ required: true, message: "重复密码不可为空" }],
        male: [{ required: false, message: "" }, { pattern: /[012]/, message: "性别参数错误" }],
        email: [{ required: true, message: "邮箱不可为空", }, { pattern: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/, message: "邮箱格式错误" }],
        code: [{ required: true, message: "验证码不可为空" }, { pattern: /^\d{4}$/, message: "验证码输入错误" }],
        serviceURL: [{ required: false, message: "" }]
    },
    client: {
        name: [{ required: true, message: "系统名不可为空" }],
        alias: [{ required: true, message: "系统别名不可为空" }],
        token: [{ required: true, message: "认证token不可为空" }],
        origin: [{ required: true, message: "系统地址不可为空" }],
        allowe: [{ required: true, message: "是否允许登录不可为空" }],
        remark: [{ required: false, message: "" }]
    }
}

module.exports = rules;