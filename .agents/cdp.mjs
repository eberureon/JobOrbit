import WebSocket from "ws";
import { writeFileSync } from "fs";

const tabs = await fetch("http://127.0.0.1:9222/json").then((r) => r.json());
const tab = tabs[0];
const wsUrl = tab.webSocketDebuggerUrl;
console.log("Tab:", tab.id);

const ws = new WebSocket(wsUrl);
let msgId = 0;

function send(method, params) {
	ws.send(JSON.stringify({ id: ++msgId, method, params: params || {} }));
}

ws.on("open", () => {
	console.log("WebSocket connected");
	send("Page.enable");
	send("Page.navigate", { url: "http://localhost:3001/applications" });
});

let navigated = false;
ws.on("message", (raw) => {
	const msg = JSON.parse(raw.toString());

	if (msg.method === "Page.frameStoppedLoading" && !navigated) {
		navigated = true;
		console.log("Page loaded, setting mobile viewport...");
		send("Emulation.setDeviceMetricsOverride", {
			width: 375,
			height: 812,
			deviceScaleFactor: 2,
			mobile: true,
		});
		setTimeout(() => {
			send("Page.captureScreenshot", { format: "png", fromSurface: true });
		}, 1000);
		return;
	}

	if (
		msg.id &&
		msg.result &&
		msg.result.data &&
		msg.result.data.length > 100 &&
		!msg._used
	) {
		msg._used = true;
		const buf = Buffer.from(msg.result.data, "base64");
		writeFileSync("/tmp/applications-mobile.png", buf);
		console.log("Mobile screenshot saved:", buf.length, "bytes");

		send("Runtime.evaluate", {
			expression: `
      JSON.stringify({
        containerWidth: document.querySelector('.overflow-x-auto')?.scrollWidth || 0,
        viewportWidth: window.innerWidth,
        isOverflowing: document.querySelector('.overflow-x-auto')?.scrollWidth > document.querySelector('.overflow-x-auto')?.clientWidth,
        tableCells: document.querySelectorAll('table th, table td').length,
        bodyHTML: document.body.innerHTML.substring(0, 200)
      })
    `,
		});
		return;
	}

	if (msg.id && msg.result && msg.result.result) {
		console.log("Mobile layout:", msg.result.result.value);

		// Try desktop viewport
		send("Page.navigate", { url: "http://localhost:3001/applications" });
		return;
	}

	if (msg.method === "Page.frameStoppedLoading" && navigated) {
		send("Emulation.setDeviceMetricsOverride", {
			width: 1280,
			height: 800,
			deviceScaleFactor: 1,
			mobile: false,
		});
		setTimeout(() => {
			send("Page.captureScreenshot", { format: "png", fromSurface: true });
		}, 1000);
		return;
	}

	if (
		msg.id &&
		msg.result &&
		msg.result.data &&
		msg.result.data.length > 100 &&
		navigated
	) {
		const buf = Buffer.from(msg.result.data, "base64");
		writeFileSync("/tmp/applications-desktop.png", buf);
		console.log("Desktop screenshot saved:", buf.length, "bytes");
		ws.close();
	}
});

setTimeout(() => {
	console.log("Timeout");
	process.exit(1);
}, 30000);
