import pkg from '../../package.json' with { type: 'json' };

export async function load() {
	return {
		version: pkg.version
	};
}
