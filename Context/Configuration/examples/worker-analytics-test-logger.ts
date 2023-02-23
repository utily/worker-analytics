import { Listener } from "service/Listener";

export default {
	name: "worker-analytics-test-logger",
	type: "logger",

	filter: [
		{
			type: "selectively",
			expression: "source:worker-analytics-test",
		},
		{ type: "useragent" },
		{
			type: "mapping",
			mapping: [
				["created", "created"],

				["browser.name", "browserName"],
				["browser.version", "browserVersion"],

				["os.name", "osName"],
				["os.version", "osVersion"],

				["device.model", "deviceModel"],
				["device.type", "deviceType"],
				["device.vendor", "deviceVendor"],

				["cloudflare.country", "country"],
				["cloudflare.region", "region"],
				["cloudflare.city", "city"],
				["cloudflare.postalCode", "postalCode"],
				["cloudflare.longitude", "posObject.x"],
				["cloudflare.latitude", "posObject.y"],
				["cloudflare.latitude", "pos[1]"],
				["cloudflare.longitude", "pos[0]"],
				["header.cfConnectionIp", "ip"],
				["cloudflare.asOrganization", "isp"],
				["cloudflare.colo", "airport"],
				["cloudflare.isEUCountry", "eu"],
				["cloudflare.httpProtocol", "httpProtocol"],
				["cloudflare.tlsVersion", "tlsVersion"],
				["cloudflare.timezone", "timezone"],
			],
		},
	],
	batchSize: 10,
	batchInterval: 3,
} satisfies Listener.Configuration
