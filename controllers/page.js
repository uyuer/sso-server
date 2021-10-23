const login = async (ctx, next) => {
    return ctx.render("login", {
        title: "SSO-Consumer | Login Page"
    });
}

module.exports = {
    login
}