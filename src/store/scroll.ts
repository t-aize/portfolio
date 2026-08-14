import { createStore } from "zustand/vanilla";

interface ScrollState {
  progress: number;
  velocity: number;
}

// Plain vanilla store, not the React hook. Scroll velocity changes every
// frame; reading it via `scrollStore.getState()` inside useFrame keeps R3F's
// render loop from triggering a React re-render 60x/sec. Reach for
// `useStore(scrollStore)` only where a component genuinely needs to
// re-render on scroll (rare).
export const scrollStore = createStore<ScrollState>(() => ({
  progress: 0,
  velocity: 0,
}));
