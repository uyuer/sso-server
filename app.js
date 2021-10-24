const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const logger = require('koa-logger')
const koaBody = require("koa-body");

const config = require('./config')
const middle = require("./middle") // 中间件
const index = require('./routes')
const sso = require("./sso")

const redis = require('redis')
const session = require('express-session')

let RedisStore = require('connect-redis')(session)
let redisClient = redis.createClient()

app.use(
	session({
		store: new RedisStore({ client: redisClient }),
		saveUninitialized: false,
		secret: config.session.key,
		resave: false,
	})
)

// error handler
onerror(app)
// app.use(middle.session(app))
// app.on('session:expired',(key,value,ctx) => {
// 	console.log('session:expired')
// 	console.log(key)
// });
// app.on('session:invalid',(key,value,ctx) => {
// 	console.log('session:invalid')
// 	console.log(key)
// });
// app.on('session:missed',(key,value,ctx) => {
// 	console.log('session:missed')
// 	console.log(key)
// });
app.use(
	koaBody({
		multipart: true,  // 支持文件上传
		formidable: {
			keepExtensions: true, // 保持文件的后缀
			maxFieldsSize: config.upload.maxFieldsSize, // 文件上传大小
			uploadDir: config.upload.tempFullPath, // 设置文件上传目录，临时文件目录，需要定时清理
			onFileBegin: (name, file) => { // 文件上传前的设置
				console.log(`上传文件: ${name}`);
			},
		},
	})
);
// middlewares
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))
app.use(require("koa-static")(__dirname + "/uploads"));

app.use(views(__dirname + '/views', {
	extension: 'ejs'
}))

// 自定义中间件
app.use(middle.logger)
app.use(middle.token.gatherToken)
// app.use(middle.token.setSessionWithToken)
// app.use(middle.token.authToken)
app.use(middle.formatter(new RegExp(`^${config.API}`)))
app.use(middle.formatter(new RegExp(`^${'/sso/'}`)))
app.use(middle.param)
app.use(middle.verifyParams)

// routes
app.use(index.routes(), index.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
	console.info('捕获到错误信息\n', err)
	ctx.status = err.status || 500
	ctx.body = {
		code: err.status || 500,
		message: err.message || '异常错误',
		data: null,
	}
})

module.exports = app
