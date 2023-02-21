import * as http from "cloudly-http"
import * as isly from "isly"
import { Event } from "./Event"

export interface EventWithMetadata extends Event {
	created: string
	cloudflare?: Request["cf"]
	header: http.Request["header"]
}

export const EventWithMetadata = Event.extend<EventWithMetadata>(
	{
		created: isly.string(),
		cloudflare: isly.any(),
		header: isly.record(isly.string(), isly.string()),
	},
	"EventWithMetaData"
)

export namespace EventWithMetadata {
	/**
	 * Used for autocomplete in IDE.
	 * Usage: EventWithMetadata.Selector | (string & Record<never, never>)
	 */
	export type Selector =
		| keyof EventWithMetadata
		| `cloudflare.${keyof Required<EventWithMetadata>["cloudflare"]}`
		| `header.${
				| "aIM"
				| "accept"
				| "acceptCharset"
				| "acceptDatetime"
				| "acceptEncoding"
				| "acceptLanguage"
				| "accessControlRequestMethod"
				| "accessControlRequestHeaders"
				| "authorization"
				| "cacheControl"
				| "cfConnectionIp"
				| "cfIpCountry"
				| "connection"
				| "contentLength"
				| "contentMD5"
				| "contentType"
				| "cookie"
				| "date"
				| "expect"
				| "forwarded"
				| "from"
				| "host"
				| "http2Settings"
				| "ifMatch"
				| "ifModifiedSince"
				| "ifNoneMatch"
				| "ifRange"
				| "ifUnmodifiedSince"
				| "maxForwards"
				| "origin"
				| "pragma"
				| "proxyAuthorization"
				| "range"
				| "referer"
				| "te"
				| "trailer"
				| "transferEncoding"
				| "userAgent"
				| "upgrade"
				| "via"
				| "warning"
				| "upgradeInsecureRequests"
				| "xRequestedWith"
				| "dnt"
				| "xForwardedFor"
				| "xForwardedHost"
				| "xForwardedProto"
				| "xMsContinuation"
				| "frontEndHttps"
				| "xHttpMethodOverride"
				| "xAttDeviceId"
				| "xWapProfile"
				| "proxyConnection"
				| "xCsrfToken"
				| "xCorrelationID"
				| "xModNonce"
				| "xModRetry"
				| "saveData"
				| "xAuthToken"
				| "xTrackingId"}`
}
