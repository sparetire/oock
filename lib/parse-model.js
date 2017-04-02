const bodyParser = require('koa-bodyparser');

function parseModel(methodAndRoute, data, router) {
	let [method, pathname] = methodAndRoute.split(/\s+/);
	console.log(`Generating api ${method} ${pathname}`);
	let middleware = async (ctx, next) => {
		ctx.body = data;
	};
	let param = [].concat(pathname, bodyParser(), middleware);
	router[method].apply(router, param);
}

module.exports = parseModel;