const request = require('request');
const sha1 = require('sha1');
const os = require('os');
const URL = require('url');

const StatusCode = {
	INVALID_SECRET: 40001,
	INVALID_APPID: 40013,
	INVALID_ACCESS_TOKEN: 40014,
	NO_ACCESS_TOKEN: 41001,
	ACCESS_TOKEN_EXPIRED: 42001
};

let tokenCache = null,
	jsTicketCache = null,
	appid = '',
	secret = '';

let iptable = {
		'localhost': true,
		'0.0.0.0': true
	},
	ifaces = os.networkInterfaces();

for (var idx in ifaces) {
	ifaces[idx].forEach(item => item.family == 'IPv4' && (iptable[item.address] =
		true));
}

const _get = function (url) {
	return new Promise((rs, rj) => {
		request({
			url,
			method: 'GET',
			callback(e, r, data) {
				if (e) {
					throw e;
				}
				rs(data);
			}
		});
	});
};

function getTokenFromWechat(appid, secret) {
	return _get(
			`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`
		)
		.then(data => {
			let body = null;
			try {
				body = JSON.parse(data);
			} catch (err) {
				console.error('JSON PARSE ERROR:');
				throw err;
			}
			if (body.errcode === StatusCode.INVALID_APPID) {
				console.error('INVALID APPID:');
				throw new Error(body.errmsg);
			} else if (body.errcode === StatusCode.INVALID_SECRET) {
				console.error('INVALID SECRET:');
				throw new Error(body.errmsg);
			}
			return body;
		});
}

function getToken() {
	if (tokenCache) {
		return Promise.resolve(tokenCache);
	} else {
		return getTokenFromWechat(appid, secret)
			.then(token => {
				setTimeout(() => tokenCache = null, 7000000);
				return tokenCache = token;
			});
	}
}

function getJSTicketFromWechat(accessToken) {
	return _get(
			`https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${accessToken}&type=jsapi`
		)
		.then(data => {
			let body = null;
			try {
				body = JSON.parse(data);
			} catch (err) {
				console.error('JSON PARSE ERROR');
			}
			if (body.errcode === StatusCode.INVALID_ACCESS_TOKEN ||
				body.errcode === StatusCode.ACCESS_TOKEN_EXPIRED) {
				let e = new Error('INVALID ACCESS TOKEN');
				e.status = StatusCode.INVALID_ACCESS_TOKEN;
				throw e;
			}
			return body;
		});
}

async function getJSTicket() {
	if (jsTicketCache) {
		return Promise.resolve(jsTicketCache);
	} else {
		let accessToken = (await getToken())
			.access_token;
		return getJSTicketFromWechat(accessToken)
			.then(ticket => {
				setTimeout(() => jsTicketCache = null, 7000000);
				return jsTicketCache = ticket;
			})
			.catch(e => {
				if (e.status === StatusCode.INVALID_ACCESS_TOKEN) {
					tokenCache = null;
					// 应该加个重试次数避免无限递归调用栈过深
					return getJSTicket();
				} else {
					throw new Error('UNKOWN ERROR');
				}
			});
	}
}

function randomString(len) {
	let text = '',
		possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < len; ++i) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

function getSignature(jsapi_ticket, noncestr, timestamp, url) {
	return sha1(
		`jsapi_ticket=${jsapi_ticket}&noncestr=${noncestr}&timestamp=${timestamp}&url=${url}`
	);
}


function setWechatInfo(pappid, psecret) {
	appid = pappid;
	secret = psecret;
}

function wechatJSTicketMiddleware(opts) {
	setWechatInfo(opts.appId, opts.secret);
	return async(ctx, next) => {
		let {
			hostname,
			port
		} = URL.parse(ctx.url);

		if (!(!hostname || (iptable[hostname] && ctx.port == port))
			|| ctx.path != '/wechat-config') {
			await next();
			return;
		}

		let nonceStr = opts.nonceStr || randomString(20);
		let timestamp = Math.floor(opts.timestamp || Date.now() / 1000);
		let url = ctx.request.body.url || opts.url;
		let jsTicket = (await getJSTicket())
			.ticket;
		let signature = getSignature(jsTicket, nonceStr, timestamp, url);

		ctx.body = {
			debug: opts.debug || false,
			appId: opts.appId,
			timestamp: timestamp,
			nonceStr: nonceStr,
			signature: signature,
			jsApiList: ctx.request.body.jsApiList || opts.jsApiList || []
		};
	};
}

module.exports = wechatJSTicketMiddleware;