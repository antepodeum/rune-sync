export interface StateSynchronizer {
	read<T extends syncState>(key: string): Promise<T | null> | T | null;
	write<T extends syncState>(key: string, value: T): Promise<void | T> | void | T;

	// Optional realtime subscription
	subscribe?<T extends syncState>(key: string, write: (newValue: T) => void): () => void;
}

export type syncState = { [key: string]: unknown } | unknown[];

export interface SyncSettings {
	doNotSubscribe?: boolean;
	debounce?: number;
	throttle?: number;
}
