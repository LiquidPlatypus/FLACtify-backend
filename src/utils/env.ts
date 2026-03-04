export function requireEnv(name: string) {
	const value = process.env[name];
	if (!value) throw new Error(`${name} env var is not set`);
	return value;
}

export function requireEnvs<const K extends readonly string[]>(
	keys: K,
): Record<K[number], string> {
	const out = {} as Record<K[number], string>;
	for (const k of keys) out[k as K[number]] = requireEnv(k);
	return out;
}
