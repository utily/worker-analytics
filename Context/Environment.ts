export type Environment = Partial<{
	adminSecret: string
	eventStorage: DurableObjectNamespace
	actionStorage: DurableObjectNamespace
}>
