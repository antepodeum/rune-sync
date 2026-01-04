export function deepEqual(a: unknown, b: unknown): boolean {
	if (a === b) return true;
	if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;

	const aKeys = Object.keys(a);
	const bKeys = Object.keys(b);
	if (aKeys.length !== bKeys.length) return false;

	const objA = a as Record<string, unknown>;
	const objB = b as Record<string, unknown>;

	for (const key of aKeys) {
		if (!deepEqual(objA[key], objB[key])) return false;
	}
	return true;
}
