#!/usr/bin/env node
const Koa = require('koa');
const path = require('path');
const argv = require('yargs').argv;
const bodyParser = require('koa-bodyparser');
const controller = require('./controller');
const router = require('koa-router')();
const cors = require('./cors');
const proxyMiddleware = require('./proxy-middleware');
const wechatMiddleware = require('./wechat-middleware');
const https = require('https');
const fs = require('fs');

const configPath = argv.c || argv.config;

let config = null,
	modelDir = null,
	proxyDomain = null,
	to = null,
	corsFlag = false,
	port = 3000,
	httpsPort = 443,
	host = '0.0.0.0',
	tls = false,
	key = '',
	cert = '',
	wechatConfig = null;

if (configPath) {
	config = require(configPath);
	modelDir = config.directory && path.resolve(path.dirname(configPath), config.directory);
	proxyDomain = config.proxy;
	to = config.to;
	corsFlag = config.cors;
	port = config.port || port;
	httpsPort = config.httpsPort || httpsPort;
	host = config.host || host;
	wechatConfig = config.wechatConfig;
	tls = config.tls;
	key = config.key && path.resolve(path.dirname(configPath), config.key);
	cert = config.cert && path.resolve(path.dirname(configPath), config.cert);
} else {
	modelDir = argv.d || argv.directory;
	proxyDomain = argv.P || argv.proxy;
	to = argv.t || argv.to;
	corsFlag = argv.C || argv.cors;
	port = parseInt(argv.p || argv.port) || port;
	host = argv.h || argv.host || host;
}

const app = new Koa();

app.context.port = port;

if (corsFlag) {
	app.use(cors);
}


if (wechatConfig) {
	app.use(bodyParser()).use(wechatMiddleware(wechatConfig));
}

if (modelDir) {
	app.use(controller(modelDir, router));
}

if (proxyDomain) {
	console.log(`proxy ${proxyDomain} to ${to || 'localhost'}`);
	app.use(proxyMiddleware({
		proxy: proxyDomain,
		to: to,
		port: port
	}));
}

app.on('error', (err, ctx) => {
	console.log('GLOBAL-ERROR:');
	console.log(err);
});

app.listen(port, host);

if (tls) {
	key = fs.readFileSync(key);
	cert = fs.readFileSync(cert);
	https.createServer({
		key,
		cert
	}, app.callback()).listen(httpsPort, host);
}

console.log(`Mock server is running on: ${host}:${port}`);