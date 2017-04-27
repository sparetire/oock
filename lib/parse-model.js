const bodyParser = require('koa-bodyparser');
const sleep = require('./sleep');
const methodMap = require('./method-map');

function parseModel(methodAndRoute, data, router) {
	let [method, pathname, delay] = methodAndRoute.split(/\s+/);
	if (!methodMap[method]) {
		return;
	}
	console.log(`Generating api ${method} ${pathname}`);
	let middleware = async (ctx, next) => {
		delay = parseInt(delay, 10);
		if (delay) {
			await sleep(delay);
		}
		ctx.body = data;
	};
	let param = [].concat(pathname, bodyParser(), middleware);
	router[method].apply(router, param);
}

module.exports = parseModel;