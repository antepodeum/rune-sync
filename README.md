<div align="center">

# rune-sync

[![npm version](https://img.shields.io/npm/v/rune-sync.svg?style=flat-rounded&labelColor=222&color=ff3e00&logo=npm&logoColor=fff)](https://www.npmjs.com/package/rune-sync) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-rounded&labelColor=222&color=ffd700)](LICENSE) [![Svelte](https://img.shields.io/badge/Svelte-5%2B-orange?style=flat-rounded&logo=svelte&labelColor=222&color=ff3e00)](https://svelte.dev/) [![Types](https://img.shields.io/npm/types/rune-sync?style=flat-rounded&labelColor=222&color=blue)](https://www.npmjs.com/package/rune-sync)

</div>

A powerful and flexible Svelte 5 library for synchronizing reactive state across various storage backends, enabling seamless data persistence and real-time collaboration.

## Quick Start

### Installation

```bash
npm install rune-sync
# or
pnpm add rune-sync
# or
yarn add rune-sync
```

### Usage

```typescript
import { createSyncState } from 'rune-sync';
import { lsSync } from 'rune-sync/localstorage';

// Create a reactive state that persists to localStorage
let userSettings = lsSync('user-settings', {
	theme: 'dark',
	language: 'en'
});

// State changes are automatically saved
userSettings.theme = 'light'; // Persisted immediately
```

Yes, that's all it takes to get started!

> **Limitation:** Rune-Sync state must always be an object. You cannot use primitive values (like strings, numbers, or booleans) as the root state. Always wrap your data in an object.

## Features

- **Universal Storage Support**: Can work with any storage solution via custom synchronizers. Build your own sync logic for servers, WebRTC, cloud storage, or any API
- **Built-in Synchronizers**: Ready-to-use synchronizers for localStorage and IndexedDB with cross-tab synchronization
- **Real-time Updates**: Automatic cross-tab synchronization for localStorage and localForage
- **Performance Controls**: Built-in debounce and throttle options for optimizing write performance
- **Flexible Settings**: Configurable options for subscription control and performance tuning
- **TypeScript Support**: Full type safety with generics
- **Zero Dependencies**: Lightweight and focused on Svelte's reactivity

## Usage Examples

### Basic Usage

```typescript
import { createSyncState } from 'rune-sync';
import { lsSync } from 'rune-sync/localstorage';

// Create a reactive state that persists to localStorage
let userSettings = lsSync('user-settings', {
	theme: 'dark',
	language: 'en'
});

// State changes are automatically saved
userSettings.theme = 'light'; // Persisted immediately
```

### With Performance Controls

```typescript
import { lfSync } from 'rune-sync/localforage';

// Debounced writes (wait 500ms after changes before saving)
let searchResults = lfSync(
	'search-results',
	{
		query: '',
		results: []
	},
	{ debounce: 500 }
);

// Throttled writes (save at most once per 1000ms)
let realTimeData = lfSync(
	'realtime-data',
	{
		value: 0
	},
	{ throttle: 1000 }
);

// Disable cross-tab synchronization
let localOnlyState = lsSync(
	'local-only',
	{
		data: 'sensitive'
	},
	{ doNotSubscribe: true }
);
```

### Built-in Synchronizers

- `localStorageSync`: Browser localStorage with cross-tab synchronization via Storage API
- `localForageSync`: IndexedDB/localStorage via localForage with cross-tab synchronization via BroadcastChannel

> **Note:** If you want to use the `localForage` synchronizer, you must also install `localforage`

> **Cross-tab Sync**: Both built-in synchronizers automatically synchronize state changes across browser tabs/windows

## Creating Custom Synchronizers

Implement the `StateSynchronizer` interface to create your own storage backend:

```typescript
import type { StateSynchronizer } from 'rune-sync';

const myCustomSync: StateSynchronizer = {
	read: async (key: string) => {
		// Implement your read logic
		const data = await myStorage.get(key);
		return data ? JSON.parse(data) : null;
	},

	write: async (key: string, value: unknown) => {
		// Implement your write logic
		await myStorage.set(key, JSON.stringify(value));
	},

	// Optional: Enable real-time updates
	subscribe: (key: string, write: (newValue: T) => void) => {
		// Set up real-time listener
		// Call write() with the new value when it changes (when event occurs)
		const unsubscribe = myRealtimeService.subscribe(key, (data) => {
			write(data.value);
		});
		return unsubscribe;
	}
};

// Use your custom synchronizer
const syncState = createSyncState(myCustomSync);
let appState = syncState('app-state', { counter: 0 });
```

## API Reference

### `createSyncState(synchronizer: StateSynchronizer)`

Creates a state factory function that uses the provided synchronizer.

**Parameters:**

- `synchronizer`: Implementation of the `StateSynchronizer` interface

**Returns:** A function that creates synchronized reactive state

### State Factory Function

```typescript
const syncState = createSyncState(synchronizer);
const state = syncState<T>(key: string, initialValue: T, settings?: SyncSettings): T;
```

**Parameters:**

- `key`: Storage key for the state
- `initialValue`: Initial state value (must be object or array)
- `settings`: Optional configuration object

**Returns:** Reactive Svelte state

### `SyncSettings` Interface

```typescript
interface SyncSettings {
	// Disable cross-tab synchronization
	doNotSubscribe?: boolean;
	// Debounce writes by N milliseconds
	debounce?: number;
	// Throttle writes to at most once per N milliseconds
	throttle?: number;
}
```

### `StateSynchronizer` Interface

```typescript
interface StateSynchronizer {
	read<T>(key: string): Promise<T | null> | T | null;
	write<T>(key: string, value: T): Promise<void> | void;
	subscribe?<T>(key: string, write: (newValue: T) => void): () => void;
}
```

## License

MIT License - see [LICENSE](LICENSE) for details.

---

Made for the Svelte community
