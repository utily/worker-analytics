export type Environment = Partial<{
	adminSecret: string
	eventStorage: DurableObjectNamespace
	bucketStorage: DurableObjectNamespace
}>
