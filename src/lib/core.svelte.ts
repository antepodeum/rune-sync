import { tick } from 'svelte';
import type { StateSynchronizer, syncState } from './types.js';

function deepEqual(a: unknown, b: unknown): boolean {
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

export function createSyncState(
	synchronizer: StateSynchronizer
): <T extends syncState>(key: string, initialValue: T) => T {
	return function <T extends syncState>(key: string, initialValue: T): T {
		const state = $state(initialValue);

		let isInitialized = false;
		let isRemoteUpdating = false;
		let lastSaved: T | undefined = undefined;

		if (typeof window !== 'undefined') {
			Promise.resolve(synchronizer.read<T>(key)).then((saved) => {
				if (saved) {
					Object.assign(state, saved);
					lastSaved = structuredClone(saved);
				} else {
					lastSaved = structuredClone(initialValue);
				}
				isInitialized = true;
			});

			if (synchronizer.subscribe) {
				$effect(() => {
					const unsubscribe = synchronizer.subscribe!<T>(key, (remoteValue) => {
						isRemoteUpdating = true;
						Object.assign(state, remoteValue);
						lastSaved = structuredClone(remoteValue);

						tick().then(() => {
							isRemoteUpdating = false;
						});
					});

					return () => {
						unsubscribe();
					};
				});
			}

			$effect(() => {
				const snapshot = $state.snapshot(state);

				if (isInitialized && !isRemoteUpdating) {
					if (!deepEqual(snapshot, lastSaved)) {
						synchronizer.write(key, snapshot as T);
						lastSaved = structuredClone(snapshot as T);
					}
				}
			});
		}

		return state;
	};
}
