module.exports = function sleep(time) {
	return new Promise(rs => setTimeout(rs, time));
};