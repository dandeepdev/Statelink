<div align="center">
  <img src="https://raw.githubusercontent.com/Dandeepdev/statelink/main/docs/banner.png" alt="Statelink: Universal State Management" width="100%" />

  <h1>Statelink</h1>
  <p><b>Zero-Boilerplate Universal State Management</b></p>
  <p><i>Stop managing state. Let the state manage itself.</i></p>

  [![npm version](https://badge.fury.io/js/statelink-core.svg)](https://badge.fury.io/js/statelink-core)
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

  <br /><br />
  <a href="https://statelink-rho.vercel.app" target="_blank">
    <img src="https://img.shields.io/badge/🚀_Play_Live_Demo-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Play Live Demo" />
  </a>
  <br /><br />
</div>

<hr/>

## Core Mission: Fluid Persistence (Universal State Sync)

A low-level developer utility designed to eradicate synchronization boilerplate. Imagine a library that automatically detects changes in local state and seamlessly propagates them to distributed databases and mobile devices—without ever manually configuring REST APIs or WebSockets.

**The Value:** Making *offline-first* development the absolute default standard.

---

## The Origin

**What we were looking for:** A way to manage application data that works exactly the same across Web, Mobile, and Backend, requiring zero configuration (goodbye, Redux) and being 100% reactive by default.

**Why it didn't exist yet:** Ecosystem fragmentation. Every platform (browsers, iOS, Android) handles memory and lifecycles differently. Attempting to build something "universal" usually ends up feeling heavy, opinionated, or relying on horrific architectural compromises.

### The Promise

Megacorporations have entire dedicated teams to synchronize data across platforms. **You just need one import.**

1. **The "Mirror" Experience**: Start typing an email on your PC, stand up, and continue on your mobile phone on the exact same syllable, with zero synchronization lag.
2. **True Offline-First**: Whether you're in a basement or on an airplane, the app never shows a "loading" spinner. Data is managed exactly the same way on disk as it is in memory.
3. **The End of Broken Reloads**: The UI will always tell the absolute truth about what resides in memory, thanks to 60fps micro-task batching.

---

## The Symmetry of Pain (The Old Way)

To save a simple collection of items that survives a page reload, you traditionally have to do this:

```typescript
// ❌ REDUX + REDUX-PERSIST + THUNKS (The Past)
const persistConfig = { key: 'root', storage: AsyncStorage };
const rootReducer = combineReducers({ verses: versesReducer });
const persistedReducer = persistReducer(persistConfig, rootReducer);
export const store = configureStore({ reducer: persistedReducer });

// In your component:
const dispatch = useDispatch();
dispatch(addVerse(newVerse)); // Create payload, deep copy, dispatch, wait for cycle...
```

### ✅ STATELINK (The Present)

Stop writing reducers. Stop installing `redux-persist`. Stop manual serialization.

```typescript
import { store, compute } from 'statelink';

// 1. The Central Truth
export const writerState = store({
    draft: "",
    savedVerses: new Set<string>(), // We use Native Sets! (Zero manual parsing)
    lastEdited: new Date()          // We use Native Dates!
}, { persist: true, key: 'writer-forge' });

// 2. Use it like pure JavaScript
writerState.savedVerses.add("Immortalize your thoughts");
writerState.draft = ""; 
```

Statelink silently tracks deep mutations, uses high-performance built-in codecs to serialize complex objects (`Set`, `Map`, `Date`, `Error`), notifies the UI, and automatically saves to the hard drive.

---

## State Ontology

In Statelink, **memory is persistence**. There is no separation between what the user sees on screen and what is saved in local storage. Mutate the state, and Statelink handles the thermodynamics behind the scenes.

### ⚡ Key Features

- **Zero-Boilerplate**: Just wrap your plain object in `store()`.
- **Native Structures & Errors**: Freely use `Set`, `Map`, `Date`, and `Error`. Our custom *Codec Engine* ensures that even complex objects and error stacktraces survive hard closures and app reboots.
- **Smart Reactive Graph**: The `compute()` function evaluates derived properties only when their specific dependencies change.
- **Automatic Garbage Collection**: Uses `FinalizationRegistry` to surgically clean up orphan effects when a compute is no longer needed, preventing memory leaks without ever needing manual `destroy()` calls.
- **Microtask Batching**: Mutate the state 100 times synchronously in a row; Statelink will batch the changes and update the UI exactly once per frame, guaranteeing 60fps performance.

## Quick Start (React)

```bash
npm install statelink-core
```

### 0. The Adapter Setup (The Missing Link)
To make the library "speak the language" of your platform (Web, Node, or React Native), simply call the adapter at your entry point once. This keeps the core library pure and agnostic:

```tsx
// In your entry point (e.g., main.tsx / App.tsx)
import { configureStorelink } from 'statelink-core/web'; 
configureStorelink(); 
```

### 1. Hook it to your UI

```tsx
import { useStatelink } from 'statelink/react'; // (Coming soon to the core package)
import { writerState } from './logic';

export default function WriterApp() {
    // Hook the magic store to your component
    useStatelink(writerState);
    
    return (
        <textarea 
            value={writerState.draft}
            onChange={e => writerState.draft = e.target.value} // Direct Mutation
        />
    );
}
```

## Async Magic: The Query API

Stop manually handling loading and error states. Statelink includes a powerful `query` function for asynchronous data that is reactive by default:

```typescript
import { query } from 'statelink';

export const postsState = query({
    key: 'latest-posts',
    fetch: () => fetch('/api/posts').then(res => res.json()),
    staleTime: 1000 * 60 // One minute of absolute freshness
});

// postsState.status, postsState.isFetching, and postsState.data are fully reactive!
```
The app never shows a "loading" icon unnecessarily.

## Live Demo: "The Writer's Forge"

This isn't vaporware. We built a professional, offline-first application demonstrating data immediacy and survival. The state code is exactly 15 lines long. Click the "Play Live Demo" badge at the top of this document to experience it right now.

---

<div align="center">
  Built to democratize development by <b>Dandeepdev</b>.
</div>
