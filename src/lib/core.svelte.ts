import { tick, untrack, onDestroy } from 'svelte';
import type { StateSynchronizer, syncState, SyncSettings } from './types.js';

function replaceState(target: Record<string, unknown>, source: Record<string, unknown>): void {
	for (const key of Object.keys(target)) {
		if (!(key in source)) {
			delete target[key];
		}
	}
	Object.assign(target, source);
}

function deepEqual(a: unknown, b: unknown): boolean {
	if (a === b) return true;
	if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false;
	const aKeys = Object.keys(a);
	const bKeys = Object.keys(b);
	if (aKeys.length !== bKeys.length) return false;
	for (let i = 0; i < aKeys.length; i++) {
		const key = aKeys[i] as keyof typeof a;

		if (!deepEqual(a[key], b[key])) return false;
	}
	return true;
}

export function createSyncState(synchronizer: StateSynchronizer) {
	return function <T extends syncState>(
		key: string,
		initialValue: T,
		settings: SyncSettings = {}
	): T {
		const state = $state(initialValue);

		const cleanupRoot = $effect.root(() => {
			let isInitialized = false;
			let isRemoteUpdating = false;
			let lastSaved: T | undefined = undefined;
			let debounceTimer: ReturnType<typeof setTimeout> | null = null;
			let lastThrottleTime = 0;

			if (typeof window !== 'undefined') {
				untrack(() => {
					Promise.resolve(synchronizer.read<T>(key)).then((saved) => {
						if (saved) {
							replaceState(state, saved);
							lastSaved = structuredClone(saved);
						} else {
							lastSaved = structuredClone(initialValue);
						}
						isInitialized = true;
					});
				});

				if (synchronizer.subscribe && !settings.doNotSubscribe) {
					$effect(() => {
						const unsubscribe = synchronizer.subscribe!<T>(key, (remoteValue) => {
							isRemoteUpdating = true;
							replaceState(state, remoteValue);
							lastSaved = structuredClone(remoteValue);
							tick().then(() => (isRemoteUpdating = false));
						});
						return () => unsubscribe();
					});
				}

				$effect(() => {
					const snapshot = $state.snapshot(state);

					if (!isInitialized || isRemoteUpdating || deepEqual(snapshot, lastSaved)) return;

					const runWrite = () => {
						untrack(() => {
							synchronizer.write(key, snapshot as T);
							lastSaved = structuredClone(snapshot as T);
						});
					};

					// Throttle
					if (settings.throttle) {
						const now = Date.now();
						if (now - lastThrottleTime >= settings.throttle) {
							lastThrottleTime = now;
							runWrite();
						}
						return;
					}

					// Debounce
					if (settings.debounce) {
						if (debounceTimer) clearTimeout(debounceTimer);
						debounceTimer = setTimeout(runWrite, settings.debounce);
					} else {
						runWrite();
					}
				});
			}
		});

		// Try to cleanup when component unmounts
		// This prevents memory leaks when used in components
		try {
			// If we're inside a component, onDestroy will work
			onDestroy(() => {
				cleanupRoot();
			});
		} catch {
			// Ignore error - we're in global context
		}

		return state;
	};
}
