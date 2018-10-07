"use strict";
const puppeteer = require("puppeteer-core");
const launchChrome = require("@serverless-chrome/lambda");

function getDebuggerUrl(baseUrl) {
	return new Promise((resolve, reject) => {
		request(
			{
				method: "GET",
				url: `${baseUrl}/json/version`,
				json: true,
				timeout: 5000
			},
			(e, res, body) => {
				if (e) {
					return reject(e);
				}

				const debuggerUrl = body.webSocketDebuggerUrl;

				if (!debuggerUrl) {
					return reject(new Error("Couldn't find debugger url from response"));
				}

				resolve(debuggerUrl);
			}
		);
	});
}

module.exports.handler = async event => {
	const chrome = await launchChrome({
		flags: [
			"--headless",
			"--disable-gpu",
			"--window-size=1600,1400",
			"--hide-scrollbars"
		]
	});
	const debuggerUrl = await getDebuggerUrl(chrome.url);
	const browser = await puppeteer.connect({
		browserWSEndpoint: debuggerUrl
	});
	console.log(browser.version());
};
