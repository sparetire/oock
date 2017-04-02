const bodyParser = require('koa-bodyparser');
function parseMiddleware(methodAndRoute, middleware, router) {
	let [method, pathname] = methodAndRoute.split(/\s+/);
	console.log(`Generating api ${method} ${pathname}`);
	let param = [].concat(pathname, bodyParser(), middleware);
	router[method].apply(router, param);
}

module.exports = parseMiddleware;