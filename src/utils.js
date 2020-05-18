const crypto = require('crypto');

exports.shaKikoo = function (text) {
	text = Buffer.from(text, 'utf-8');
	let kikooHex = crypto.createHash('sha256').update(text).digest('hex'),
		kikooBytes = Buffer.concat([Buffer.from(kikooHex, 'utf-8'), Buffer.from([-9, 26, -90, -34, -113, 23, 118, -88, 3, -99, 50, -72, -95, 86, -78, -87, 62, -35, 67, -99, -59, -35, -50, 86, -45, -73, -92, 5, 74, 13, 8, -80])]);
	return crypto.createHash('sha256').update(kikooBytes).digest('base64');
}