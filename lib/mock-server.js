#!/usr/bin/env node
const Koa = require('koa');
const argv = require('yargs').argv;
const controller = require('./controller');
const router = require('koa-router')();
const cors = require('./cors');
const path = require('path');

const configArg = argv.config || argv.c;
let configPath = '', configDir = '', config = {};
if (configArg) {
	configPath = path.resolve(process.cwd(), configArg);
	config = require(configPath);
	configDir = path.dirname(configPath);
	config.directory = path.resolve(configDir, config.directory);
}
const dir = config.directory || argv.directory || argv.d;
const port = parseInt(config.port, 10) || parseInt(argv.port, 10) || parseInt(argv.p, 10) || 3000;
const host = config.host || argv.host || argv.h || '0.0.0.0';

const app = new Koa();

app.use(cors);

app.use(controller(dir, router));

app.on('error', (err, ctx) => {
	console.log('GLOBAL-ERROR:');
	console.log(err);
});

app.listen(port, host);

console.log(`Mock server is running on: ${host}:${port}`);