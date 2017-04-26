const bodyParser = require('koa-bodyparser');
const sleep = require('./sleep');

function sleepMiddleware(opts) {
	return async (ctx, next) => {
		await sleep(opts.delay);
		await next();
	};
}
function parseMiddleware(methodAndRoute, middleware, router) {
	let [method, pathname, delay] = methodAndRoute.split(/\s+/);
	console.log(`Generating api ${method} ${pathname}`);
	delay = parseInt(delay, 10);
	let param = delay ? [].concat(pathname, bodyParser(), sleepMiddleware({delay}), middleware) : [].concat(pathname, bodyParser(), middleware);
	router[method].apply(router, param);
}

module.exports = parseMiddleware;