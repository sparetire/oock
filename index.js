#!/usr/bin/env node

const yargs = require('yargs');
const path = require('path');
const run = require('supervisor/lib/supervisor').run;
const argv = yargs.usage('Usage: oock [options] -d directory')
	.alias('d', 'directory')
	.alias('c', 'config')
	.alias('w', 'watch')
	.alias('p', 'port')
	.alias('h', 'host')
	.describe('d', 'directory of controller and model')
	.describe('c', 'config file of oock')
	.describe('w',
		'when a change to a js file or json file occurs, reload the server. Default is false'
	)
	.describe('p', 'port of mock server')
	.describe('h', 'host of mock server')
	// .demandOption(['d'])
	.help('help')
	.example('oock -w -p 80 -h 127.0.0.1 -d ./model')
	.epilog('By Sparetire')
	.argv;

const port = argv.p || argv.port;
const host = argv.h || argv.host;
const isWatch = argv.w || argv.watch;
const directory = path.resolve(argv.d || argv.directory);
const server = path.resolve(__dirname, './lib/mock-server.js');

let args = [directory, '-e', '\'js,json\'', '--', server, '-d', directory];

if (port) {
	args = args.concat(['-p', port]);
}

if (host) {
	args = args.concat(['-h', host]);
}

if (isWatch) {
	args.unshift('-w');
}

run(args);