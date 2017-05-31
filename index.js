#!/usr/bin/env node

const yargs = require('yargs');
const path = require('path');
const run = require('supervisor/lib/supervisor').run;
const argv = yargs.usage('Usage: oock [options] -d directory\n'
	+ '       oock [options] -c ./config.json\n'
	+ '       oock -P www.google.com')
	.alias('d', 'directory')
	.alias('c', 'config')
	.alias('w', 'watch')
	.alias('p', 'port')
	.alias('h', 'host')
	.alias('C', 'cors')
	.alias('P', 'proxy')
	.alias('t', 'to')
	.describe('d', 'directory of controller and model')
	.describe('c', 'config file of oock')
	.describe('w',
		'when a change to a js file or json file occurs, reload the server. Default is false'
	)
	.describe('p', 'port of mock server ')
	.describe('h', 'host of mock server')
	.describe('C', 'enable cors')
	.describe('P', 'enable proxy')
	.describe('t', 'proxy to')
	// .demandOption(['d'])
	.help('help')
	.example('oock -w -p 80 -h 127.0.0.1 -d ./model\n'
	+ 'oock -P www.jianshu.com\n'
	+ 'oock -P www.jianshu.com -t 192.168.1.2:3000\n'
	+ 'oock -c ./config.json')
	.epilog('By Sparetire')
	.argv;


let args = [],
 configPath = argv.c || argv.config,
 config = {},
 proxy = argv.P || argv.proxy,
 to = argv.t || argv.to,
 cors = argv.C || argv.cors,
 port = argv.p || argv.port,
 host = argv.h || argv.host,
 isWatch = argv.w || argv.watch,
 modelDir = argv.d || argv.directory ? path.resolve(argv.d || argv.directory) : null,
 server = path.resolve(__dirname, './lib/mock-server.js');

if (configPath) {
	configPath = path.resolve(process.cwd(), configPath);
	config = require(configPath);
	isWatch = config.watch;
	modelDir = config.directory && path.resolve(path.dirname(configPath), config.directory) || '';
	if (isWatch && modelDir) {
		args = args.concat(['-w', modelDir, '-e', 'js,json']);
	}
	args = args.concat(['--', server, '-c', configPath]);
} else {
	isWatch && (args = args.concat(['-w', modelDir, '-e', 'js,json']));
	args = args.concat(['--', server]);
	cors && (args = args.concat(['-C']));
	port && (args = args.concat(['-p', port]));
	host && (args = args.concat(['-h', host]));
	modelDir && (args = args.concat(['-d', modelDir]));
	proxy && (args = args.concat(['-P', proxy]));
	to && (args = args.concat(['-t', to]));
}

run(args);