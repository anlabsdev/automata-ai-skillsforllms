# Skill: React Hooks Mastery
> @skillsforllms/reactskills · v1.0.0 · Category: Web / React

## Purpose
Teach an AI agent to use React hooks correctly — built-in hooks, custom hooks, composition patterns, and rules that prevent bugs.

## When to Use This Skill
- Writing custom hooks for shared logic (auth, forms, media queries).
- Using `useEffect` for side effects without introducing memory leaks.
- Optimizing renders with `useMemo`, `useCallback`, and `useRef`.
- Understanding the dependency array and stale closure traps.

## Built-in Hooks Reference

### useState
```tsx
const [count, setCount] = useState(0);

// Functional update for derived state
setCount((prev) => prev + 1);

// Lazy initialization for expensive defaults
const [data, setData] = useState(() => computeExpensiveDefault());
```

### useEffect — Side Effect Lifecycle
```tsx
useEffect(() => {
  const controller = new AbortController();

  async function fetchData() {
    const res = await fetch("/api/items", { signal: controller.signal });
    const json = await res.json();
    setItems(json);
  }

  fetchData();

  // Cleanup — runs on unmount or before re-running effect
  return () => controller.abort();
}, [/* dependencies */]);
```

**Rules:**
1. Always include a cleanup function for subscriptions, timers, and fetch requests.
2. Never lie about dependencies — add every variable the effect reads.
3. Never use `useEffect` for data fetching in production — use TanStack Query or SWR.
4. Never use `useEffect` to synchronize state (`setX` inside effect of `y` change) — derive it instead.

### useRef — Mutable References
```tsx
// DOM reference
const inputRef = useRef<HTMLInputElement>(null);
inputRef.current?.focus();

// Instance variable (persists across renders, no re-render on change)
const renderCount = useRef(0);
renderCount.current += 1;

// Previous value pattern
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
```

### useMemo and useCallback
```tsx
// Memoize expensive computation
const sortedItems = useMemo(
  () => items.toSorted((a, b) => a.name.localeCompare(b.name)),
  [items]
);

// Memoize callback passed to child components
const handleDelete = useCallback(
  (id: string) => setItems((prev) => prev.filter((item) => item.id !== id)),
  []
);
```

**When to memoize:**
- ✅ Expensive calculations (sorting, filtering large arrays).
- ✅ Callbacks passed to memoized child components (`React.memo`).
- ✅ Values used as dependencies of other hooks.
- ❌ Do NOT memoize everything — it adds complexity with no benefit for cheap operations.

### useReducer — Complex State Logic
```tsx
type Action =
  | { type: "ADD_ITEM"; payload: Item }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "TOGGLE_ITEM"; payload: string };

function itemsReducer(state: Item[], action: Action): Item[] {
  switch (action.type) {
    case "ADD_ITEM":
      return [...state, action.payload];
    case "REMOVE_ITEM":
      return state.filter((item) => item.id !== action.payload);
    case "TOGGLE_ITEM":
      return state.map((item) =>
        item.id === action.payload ? { ...item, done: !item.done } : item
      );
  }
}

const [items, dispatch] = useReducer(itemsReducer, []);
dispatch({ type: "ADD_ITEM", payload: newItem });
```

## Custom Hook Patterns

### Data Fetching Hook (with TanStack Query)
```tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => fetch("/api/users").then((res) => res.json()),
    staleTime: 5 * 60 * 1000,
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetch(`/api/users/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}
```

### Media Query Hook
```tsx
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

// Usage
const isMobile = useMediaQuery("(max-width: 768px)");
```

### Debounced Value Hook
```tsx
export function useDebouncedValue<T>(value: T, delayMs: number = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

// Usage
const debouncedSearch = useDebouncedValue(searchTerm, 400);
```

### Local Storage Hook
```tsx
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((prev: T) => T)) => {
    const newValue = value instanceof Function ? value(storedValue) : value;
    setStoredValue(newValue);
    localStorage.setItem(key, JSON.stringify(newValue));
  };

  return [storedValue, setValue] as const;
}
```

## Rules of Hooks
1. **Only call hooks at the top level** — never inside loops, conditions, or nested functions.
2. **Only call hooks from React functions** — components or custom hooks, not plain utility functions.
3. **Custom hooks must start with `use`** — `useAuth`, `useTheme`, `useDebounce`.
4. **Keep hooks focused** — one responsibility per hook. Compose multiple hooks for complex behavior.

## Anti-Patterns
- ❌ Never use `useEffect` as a "watcher" to sync two state variables — derive the value instead.
- ❌ Never ignore the exhaustive-deps ESLint rule — fix the dependency array.
- ❌ Never put hooks inside `if` statements or early returns.
- ❌ Never use `useRef` to store state that should trigger re-renders — use `useState`.
- ❌ Never fetch data in `useEffect` without proper abort/cleanup handling.

## Changelog
- v1.0.0 — Initial release.
