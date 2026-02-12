<div align="center">

# rune-sync

[![npm version](https://img.shields.io/npm/v/rune-sync.svg?style=flat-rounded&labelColor=222&color=ff3e00&logo=npm&logoColor=fff)](https://www.npmjs.com/package/rune-sync) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-rounded&labelColor=222&color=ffd700)](LICENSE) [![Svelte](https://img.shields.io/badge/Svelte-5%2B-orange?style=flat-rounded&logo=svelte&labelColor=222&color=ff3e00)](https://svelte.dev/) [![Types](https://img.shields.io/npm/types/rune-sync?style=flat-rounded&labelColor=222&color=blue)](https://www.npmjs.com/package/rune-sync)

Svelte 5 reactive state that automatically persists to any storage backend.

</div>

## Quick Start

```bash
npm install rune-sync
```

```typescript
import { lsSync } from 'rune-sync/localstorage';

let settings = lsSync('settings', { theme: 'dark', lang: 'en' });

settings.theme = 'light'; // Persisted automatically
```

> **Note:** State must always be an object — primitives are not supported as root values.

## Drivers

### localStorage

```typescript
import { lsSync } from 'rune-sync/localstorage';

let state = lsSync('key', { count: 0 });
```

Cross-tab sync via the native `storage` event. No extra dependencies.

### localForage (IndexedDB)

```bash
npm install localforage
```

```typescript
import { lfSync } from 'rune-sync/localforage';

let state = lfSync('key', { count: 0 });
```

Cross-tab sync via `BroadcastChannel`. Requires `localforage` as a peer dependency.

### Cookie

```typescript
import { ckSync } from 'rune-sync/cookie';

// Default options (path: '/', sameSite: 'lax')
let state = ckSync('key', { count: 0 });
```

With custom cookie settings:

```typescript
import { createCookieSync } from 'rune-sync/cookie';

const cookieSync = createCookieSync({
  path: '/',
  maxAge: 86400,
  sameSite: 'strict',
  secure: true
});

let state = cookieSync('key', { count: 0 });
```

Cross-tab sync via `BroadcastChannel`. Keep in mind the ~4KB cookie size limit.

**`CookieOptions`:**

| Option     | Type                               | Default |
| ---------- | ---------------------------------- | ------- |
| `path`     | `string`                           | `'/'`   |
| `domain`   | `string`                           | —       |
| `maxAge`   | `number` (seconds)                 | —       |
| `expires`  | `Date`                             | —       |
| `sameSite` | `'strict'` \| `'lax'` \| `'none'`  | `'lax'` |
| `secure`   | `boolean`                          | —       |

## Settings

All drivers accept an optional third argument:

```typescript
let state = lsSync('key', { value: 0 }, {
  debounce: 500,     // Wait 500ms after last change before writing
  throttle: 1000,    // Write at most once per 1000ms
  doNotSubscribe: true // Disable cross-tab sync
});
```

| Option           | Type      | Description                                 |
| ---------------- | --------- | ------------------------------------------- |
| `debounce`       | `number`  | Delay writes by N ms after the last change  |
| `throttle`       | `number`  | Write at most once per N ms (with trailing) |
| `doNotSubscribe` | `boolean` | Disable cross-tab synchronization           |

## Custom Synchronizers

Implement the `StateSynchronizer` interface to use any storage backend:

```typescript
import { createSyncState } from 'rune-sync';
import type { StateSynchronizer } from 'rune-sync';

const mySynchronizer: StateSynchronizer = {
  read: async (key) => {
    const data = await myStorage.get(key);
    return data ?? null;
  },

  write: async (key, value) => {
    await myStorage.set(key, value);
  },

  // Optional: enable real-time updates
  subscribe: (key, write) => {
    const unsubscribe = myRealtimeService.on(key, (data) => {
      write(data);
    });
    return unsubscribe;
  }
};

const mySync = createSyncState(mySynchronizer);
let state = mySync('app-state', { counter: 0 });
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
