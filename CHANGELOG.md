# Changelog

## [1.0.0] - 2025-08-18

### 🎉 Initial Release

- First stable release of **@mints/hooks**.
- A collection of production-ready React hooks, fully typed with TypeScript.
- Designed for modern React apps, with focus on simplicity, composability, and DX.

#### ✨ Hooks

- `useAutoRefresh` — periodically trigger callbacks with pause/resume support
- `useDebounce` — manage debounced values with flexible options
- `useHotkeys` — declarative keyboard shortcut binding
- `useOutsideClick` — detect clicks outside of a target element
- `useStorage` — sync state with `localStorage` / `sessionStorage`
- `useTimer` — timer & countdown with persistence and cross-tab sync
- `useToggle` — simple boolean toggle state management
- `useUrlState` — sync React state with URL query parameters

#### 🛠 Internal

- Set up unified testing via **Vitest**
- Configured linting and formatting with ESLint + Prettier
- Added GitHub workflow & templates for CI/CD and contributions
