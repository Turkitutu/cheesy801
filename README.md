# Cheesy801
*An atelier 801 forums client bot*

## Install using npm
`npm i cheesy801`

## How to use ?
```js
const {Client} = require('cheesy801');
const bot = new Client();
const account = {
	'username': 'Username#0000',
	'password': 'password',
	'encrypted': false,
	'redirect': 'index'
};

async function start()
{
	await bot.login(account);
}

bot.on('ready', (result, response) => {
	console.log(`Login with name ${bot.username}`);
});

bot.on('connect_failed', (result, response) => {
	console.log(`Couldn't login with account name ${bot.username}\nResult :`, result);
});

start();
```
