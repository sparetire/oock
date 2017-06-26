async function cors(ctx, next) {
	ctx.set('Access-Control-Allow-Origin', '*');
	ctx.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
	ctx.set('Access-Control-Allow-Headers',
		'Content-Type,Content-Length,Accept,Accept-Charset,Accept-Encoding,Authorization,X-Requested-With,Token'
	);
	ctx.set('Access-Control-Allow-Credentials', 'true');
	ctx.set('Access-Control-Max-Age', '7200');
	if (ctx.request.method === 'OPTIONS') {
		ctx.body = 'OK';
		return;
	}
	await next();
}

module.exports = cors;