#!/usr/bin/env node
const Koa = require('koa');
const path = require('path');
const argv = require('yargs').argv;
const controller = require('./controller');
const router = require('koa-router')();
const cors = require('./cors');
const proxyMiddleware = require('./proxy-middleware');
const wechatMiddleware = require('./wechat-middleware');

const configPath = argv.c || argv.config;

let config = null,
	modelDir = null,
	proxyDomain = null,
	to = null,
	corsFlag = false,
	port = 3000,
	host = '0.0.0.0',
	wechatConfig = null;

if (configPath) {
	config = require(configPath);
	modelDir = config.directory && path.resolve(path.dirname(configPath), config.directory);
	proxyDomain = config.proxy;
	to = config.to;
	corsFlag = config.cors;
	port = config.port;
	host = config.host;
	wechatConfig = config.wechatConfig;
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
	app.use(wechatMiddleware(wechatConfig));
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

console.log(`Mock server is running on: ${host}:${port}`);