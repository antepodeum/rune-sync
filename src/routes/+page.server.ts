import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

export async function load() {
	const __dirname = fileURLToPath(new URL('.', import.meta.url));
	const packagePath = join(__dirname, '..', '..', 'package.json');
	const pkg = JSON.parse(readFileSync(packagePath, 'utf-8'));

	return {
		version: pkg.version
	};
}
