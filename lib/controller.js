const glob = require('glob');
const path = require('path');
const parseMiddleware = require('./parse-middleware');
const parseModel = require('./parse-model');

function getFiles(dir) {
	let opts = {
		root: path.resolve(dir)
	};
	return glob.sync('/**/*.@(js|json)', opts);
}


function getControllers(dir, router) {
	let files = getFiles(dir);
	files.forEach(fileName => {
		let group = require(fileName);
		console.log(`Loading file ${fileName}...`);
		for (let key in group) {
			if ((Array.isArray(group[key]) && (typeof group[key][0] == 'function'))
			|| typeof group[key] === 'function') {
				parseMiddleware(key, group[key], router);
			} else {
				parseModel(key, group[key], router);
			}
		}
	});
	return router.routes();
}

module.exports = getControllers;