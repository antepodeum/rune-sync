import { onDestroy, tick } from 'svelte';
import type { StateSynchronizer, syncState } from './types.js';

// Deep object comparison
function deepEqual(a: unknown, b: unknown): boolean {
	if (a === b) return true;
	if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
	const aKeys = Object.keys(a as object);
	const bKeys = Object.keys(b as object);
	if (aKeys.length !== bKeys.length) return false;
	return aKeys.every((key) =>
		deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])
	);
}

export function createSyncState(synchronizer: StateSynchronizer) {
	return function <T extends syncState>(key: string, initialValue: T): T {
		const state = $state(initialValue);
		let isInitialized = false;
		let isRemoteUpdating = false;
		let lastSaved: T | undefined = undefined;

		if (typeof window !== 'undefined' || synchronizer.serverCompatible) {
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
				const unsubscribe = synchronizer.subscribe<T>(key, (remoteValue) => {
					isRemoteUpdating = true;
					Object.assign(state, remoteValue);
					lastSaved = structuredClone(remoteValue);
					tick().then(() => {
						isRemoteUpdating = false;
					});
				});
				onDestroy(unsubscribe);
			}

			$effect.root(() => {
				$effect(() => {
					const snapshot = $state.snapshot(state);
					if (isInitialized && !isRemoteUpdating && !deepEqual(snapshot, lastSaved)) {
						synchronizer.write(key, snapshot as T);
						lastSaved = structuredClone(snapshot as T);
					}
				});
			});
		}

		return state;
	};
}
