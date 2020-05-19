const fetch = require('node-fetch');
const querystring = require('querystring');
const {shaKikoo} = require('./utils');
const EventEmitter = require('events')
class Client extends EventEmitter {
	constructor() {
		super();
		this.cookies = {
			langue_principale: 'en',
			JSESSIONID: ''
		}
		this.isLogged = false;
	}

	parseCookies(cookies){
		for (const i in cookies) {
			const [index, value] = cookies[i].split(';')[0].split('=');
			this.cookies[index] = value;
		}
	}

	async getTokens(name){
		const resp = await this.request(`http://atelier801.com/${name}`, 'get', { cookies: this.cookies});
		const body = await resp.text();
		const [_text, tokenName, tokenValue] = body.match(/<input type="hidden" name="(.*?)" value="(.*?)">/);
		return [tokenName, tokenValue];
	}

	async createDiscussion(names, subject, content) {
		const keys = (await this.getTokens('new-discussion'));
		const headers = {
			'Referer': 'https://atelier801.com/new-discussion',
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
		};
		const data = {
			destinataires: (Array.isArray(names) ? names.join('§') : names),
			objet: subject,
			message: content,
			[keys[0]]: keys[1]
		};
		const resp = await this.request('create-discussion', 'post', { data: data, headers: headers, cookies: this.cookies });
		const result = JSON.parse(await resp.text());
		if (result.redirection)
			this.emit('discussion_create', names, subject, content, resp);
		else
			this.emit('discussion_failed', result, resp);
	}

	async sendPrivateMessage(name, subject, content) {
		const keys = (await this.getTokens('new-dialog'));
		const headers = {
			'Referer': 'https://atelier801.com/new-dialog',
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
		};
		const data = {
			destinataire:  name,
			objet: subject,
			message: content,
			[keys[0]]: keys[1]
		};
		const resp = await this.request('create-dialog', 'post', { data: data, headers: headers, cookies: this.cookies });
		const result = JSON.parse(await resp.text());
		if (result.redirection)
			this.emit('message_sent', name, subject, content, resp);
		else
			this.emit('message_failed', result, resp);
	}

	async login(options) {
		if (options === undefined)
			throw new Error('Options argument couldn\'t be empty.');
		if (!options.username || !options.password)
			throw new Error('You should enter an username and password.');

		this.password = options.encrypted === false || options.encrypted === undefined ? shaKikoo(options.password) : options.password;
		this.username = options.username;
		let redirect = options.redirect ? options.redirect : 'index';
		const keys = (await this.getTokens('login'));
		const data = {
			redirect: `http://atelier801.com/${redirect}`,
			id: this.username,
			pass: this.password,
			rester_connecte: 'on',
			[keys[0]]: keys[1]
		};
		const headers = {
			'Referer': 'https://atelier801.com/login',
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
			'X-Requested-With': 'XMLHttpRequest'
		};
		const resp = await this.request('https://atelier801.com/identification', 'post', { data: data, headers: headers, cookies: this.cookies });
		const result = JSON.parse(await resp.text());
		if (result.redirection)
			this.emit('ready', result, resp);
		else
			this.emit('connect_failed', result, resp);

	}

	async request(url, method = 'get', options = {}) {
		if (!url.startsWith('https:') && !url.startsWith('http:'))
			url = `https://atelier801.com/${url}`;
		const fetch_options = {
			method: method,
			credentials: 'include',
			headers: {}
		};
		if (options.headers)
			fetch_options.headers = options.headers;
		let rawCookies = '';
		for (const cookie in this.cookies)
			rawCookies += (rawCookies !== '' ? '; ' : '') + cookie + '=' + this.cookies[cookie];
		fetch_options.headers.cookie = rawCookies;

		if (options.data) {
			let rawData = '';
			for (const name in options.data)
				rawData += (rawData !== '' ? '&' : '') + name + '=' + querystring.escape(options.data[name]);

			fetch_options.body = rawData;
		}
		const resp = await fetch(url, fetch_options);
		this.parseCookies(resp.headers.raw()['set-cookie']);
		this.emit('request', url, method, options, resp);
		return resp;
	}

	async disconnect(){
		const keys = (await this.getTokens('index'));
		const headers = {
			'Referer': 'https://atelier801.com/index',
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
		};
		const data = {
			[keys[0]] : keys[1]
		};
		const res = await this.request('https://atelier801.com/deconnexion', 'post', { data: data, headers: headers });
		const result = JSON.parse(await res.text());
		if (result.redirection)
			this.emit('disconnect', result, res);
		else
			this.emit('disconnect_failed', result, res);

	}
}
module.exports = Client;