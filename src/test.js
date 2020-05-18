const client = new (require('./client'));
async function start() {
	await client.login('Helper_ar#0000', 'Helpers@will@help8');
	await client.sendPrivateMessage('Omaraldin#1619', 'test', 'ok');
}

client.on('message_sent', (target, subject, message, resp) => {
	console.log(target, subject);
});

client.on('message_failed', (result) => {
	console.log('Failed to send message.', result);
});

client.on('ready', (result, resp) => {
	console.log(result);
});

client.on('connect_failed', (result, resp) => {
	console.log(result);
});

client.on('request', (url, method, opts, resp) => {
	console.log(url, method);
});

start();