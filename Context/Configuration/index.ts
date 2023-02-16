import * as isly from "isly"
import { ListenerConfiguration } from "../../service/Listener/ListenerConfiguration"
import { Environment } from "../Environment"

export interface Configuration {
	listeners: ListenerConfiguration[]
}

// TODO replace with KV
const dummy: Configuration = {
	listeners: [
		{
			name: "all",
			filter: [],
			type: "logger",
			batchSize: 10,
			batchDuration: 2,
		},
		{
			name: "localhost",
			filter: [
				{
					type: "selectively",
					expression: "source:localhost",
				},
				{
					type: "mapping",
					mapping: [
						["created", "created"],
						["cloudflare.region", "region"],
						["cloudflare.longitude", "posO.x"],
						["cloudflare.latitude", "posO.y"],
						["cloudflare.latitude", "pos[1]"],
						["cloudflare.longitude", "pos[0]"],
					],
				},
			],
			type: "logger",
			batchSize: 10,
			batchDuration: 3,
		},

		// 	{
		// 		name: "localhost",
		// 		filter: "source:localhost",
		// 		comment: "Get all with localhost as source.",
		// 		type: "http",
		// 		target: "localhost",
		// 		batchSize: 10,
		// 	},
		// 	{
		// 		name: "big-query-paxport-paxshop-analytics-dev",
		// 		type: "big-query",
		// 		privateKey: {
		// 			type: "service_account",
		// 			project_id: "prefab-backbone-377710",
		// 			private_key_id: "9342ff124fd239d81dc2c4c3b5d46e972db54cc0",
		// 			private_key:
		// 				"-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDND0yMopfzG5iV\nzsVGxbM8mC7Kb73Dh1DM2z3kn8aFHJckMa93WGPTIzeTcMiAzTyF8rfrhaj4i91E\nGJ0rCZi2ilGf3hqLAW4QEPwJ9Ta8PVNZq/uS2pjugpvZiXJM9FXUJGgMwWu0Sh3W\n5zBnzXDHGOKJLIp9brZXZ/VQKlr0eAzCNj3ihvnoiymb4WpoJn+9EX5LnbuGlmPw\n4Yc33jefpUhXT8WC88PEBNdssFji36feGFYq5worHpDKdl0lR6AlXieAo21n/E4Y\nfDdwly2BggiYVdym47xK9OomJ6zzaSox9oapa7ILDaHEYLPo3HCjnw6QBVXc3JiP\n0tuCa1EjAgMBAAECggEAAcdcatnuCTAAZ67BfAoIOuFldzicNQNIxBniOhfTM+i/\nn/OjiconVrkgPNKZlgbtd23xNcU6BVVh9/lLTr61XZ2BXbXeIOXBbveqqRe4HEYV\nVOue/qNt0HJp2398FFaLIuWxU6183bsvNkdkcl3L759B/o6Ik2fVbSxn8vkjQuL7\nuksu7e3w9+T94de42zYiwv5L3BQ0SZiUXapUmS5k1SrAUO9fJG6QHu38OgrVYijp\nMKw+iMwrYlE9hl+8Ma6mHQgrslFO/1uTNmIhuzQ+ARMH4brDHVyQUMW6mV0cIdby\nQFn5Oe54wmqOfvfr8xiONkHN3Rb9tmc4Kux3Xbg7IQKBgQDo3OfR5x8BvWow4xcZ\nKH4bDRFj6vasx9SjAXkY6BL3lAAf5H45JXHFYhGiBq4ztV5zf4Fov2bhbk1GVlz+\nZKJT3DKghUR9Lae5Mb/Y4XD2OCqvvneQFckxKbg1O9vbJy7D2oaDkYHfa+baNLS2\nZvNQcCTWqQSCBFVP84+0b0NK+wKBgQDhbzF9trnc7Fe15j2GGxDMfgyWhBa2EpsL\nKDwKgFJRoq23c0JkkNEFQXq+V6QjNZkS6c1Naynlkj8jmYnVZewuBzc/aW+ZKrOm\n5IeFSQgrzlQ28e99xAYxySe8G81MIvGbjhMjBMF7wtMHuFUdtlH4kUvPuhEocBh9\nJJfIH9i5+QKBgFbMyUjP2xn97hBtBdYl5uPUejABjJOZJWThjq8/CprouycoN/i7\nQW5vAN2hmdvCdoOc+rL97a6IPBvE44McJfoWcXSuWHpEw2lf5wBEAKR3CUpbOBwo\nUseVoomNV4WYVHFDCrMOURfkE7gwv0/ijj3kn4a4l+qTDO3xfxamBrJzAoGBAKnA\nNe8o2dneacmB3tANr1+chtQMEKH3bqI/IL7zk4j/S3n5I4Rge9ROUyPjEKimomZY\ngYyLZlgFAOBIrD5xah/atSJdvXgDbJX+PYIC1VFPI6DgGuuD4Po6M151POjY4z+0\nAvr6iMstkASfLBCciir3FbQMswDVL8uD83rxaBvZAoGBAIUYh3v3t8JHinj7lTjH\nePzrC45Oeyv2FwRE2dIUct4uJsnO5UOPj0sKd0BSwyX9niYuTBNVkai0pV+iJbsS\nqlMdZ8q4NlFYyv1NXTJsoPEyGOAEnpZX9BoUlqiZZpYnIB07vDMFLP94mUoiLtOM\ni0e+cK2Vd6UlvWv6OpeYPDlw\n-----END PRIVATE KEY-----\n",
		// 			client_email: "paxport-paxshop-analytics-dev@prefab-backbone-377710.iam.gserviceaccount.com",
		// 			client_id: "116287929807825169678",
		// 			auth_uri: "https://accounts.google.com/o/oauth2/auth",
		// 			token_uri: "https://oauth2.googleapis.com/token",
		// 			auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
		// 			client_x509_cert_url:
		// 				"https://www.googleapis.com/robot/v1/metadata/x509/paxport-paxshop-analytics-dev%40prefab-backbone-377710.iam.gserviceaccount.com",
		// 		},
		// 		filter: "",
		// 		batchSize: 10,
		// 	},
	],
}

export namespace Configuration {
	export const type = isly.object<Configuration>(
		{
			listeners: isly.array(ListenerConfiguration.type),
		},
		"Configuration"
	)
	export const is = type.is
	export const flaw = type.flaw

	export async function load(environment: Environment): Promise<Configuration | undefined> {
		let result: Configuration | undefined
		const config = dummy
		if (is(config))
			result = config
		else
			console.error(JSON.stringify(flaw(config), null, 2))

		return result
	}
}
