import localforage from 'localforage';
import type { StateSynchronizer } from '../types.js';
import { createSyncState } from '../core.svelte.js';

export const lfSynchronizer: StateSynchronizer = {
	read: (key) => localforage.getItem(key),
	write: (key, val) => localforage.setItem(key, val)
};

export const lfSync = createSyncState(lfSynchronizer);
