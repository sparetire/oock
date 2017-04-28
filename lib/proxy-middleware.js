const request = require('request');
const os = require('os');
const URL = require('url');

let iptable = {'localhost': true, '0.0.0.0': true}, ifaces = os.networkInterfaces();

for (var idx in ifaces) {
	ifaces[idx].forEach(item => item.family == 'IPv4' && (iptable[item.address] = true));
}


function proxy(opts) {
	/**
	 * {
	 *   proxy: www.baidu.com,
	 *   port: 443,
	 *   https: true,
	 *   to: 192.168.1.2
	 * }
	 */
	return async (ctx, next) => {
		let isTransParentProxy = !!opts.to;
		if (!isTransParentProxy) {
			let {hostname, port} = URL.parse(ctx.url);
			port = port || 80;
			if (!hostname || (iptable[hostname] && port == opts.port)) {
				ctx.body = ctx.req.pipe(request({
					url: `http://${opts.proxy}${ctx.path}`
				}));
			} else {
				ctx.body = ctx.req.pipe(request({
					url: ctx.url
				}));
			}
		} else {
			let [proxyHost, proxyPort] = opts.proxy.split(':');
			proxyPort = proxyPort || 80;
			let reqUrl = URL.parse(ctx.url);
			let reqHost = reqUrl.hostname, reqPort = reqUrl.port || 80;
			if (reqHost == proxyHost && reqPort == proxyPort) {
				ctx.body = ctx.req.pipe(request({
					url: `http://${opts.to}${ctx.path}`
				}));
			} else if (!reqHost) {
				await next();
			} else {
				ctx.body = ctx.req.pipe(request({
					url: ctx.url
				}));
			}
		}
	};
}

module.exports = proxy;