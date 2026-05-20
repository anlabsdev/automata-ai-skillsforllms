# Skill: React Performance Optimization
> @skillsforllms/reactskills · v1.0.0 · Category: Web / React

## Purpose
Teach an AI agent to identify and fix React performance issues — unnecessary re-renders, large bundles, slow lists, and expensive computations.

## When to Use This Skill
- Components re-render too often without visible changes.
- Bundle size is too large for initial page load.
- Lists with 100+ items are laggy when scrolling.
- Expensive calculations block the main thread.

## Preventing Unnecessary Re-Renders

### React.memo — Skip re-render if props are unchanged
```tsx
import { memo } from "react";

interface UserCardProps {
  name: string;
  avatar: string;
  onClick: () => void;
}

export const UserCard = memo(function UserCard({ name, avatar, onClick }: UserCardProps) {
  return (
    <div className="user-card" onClick={onClick}>
      <img src={avatar} alt={name} />
      <span>{name}</span>
    </div>
  );
});
```

### useCallback — Stabilize callback references
```tsx
// Without useCallback, a new function is created every render,
// defeating React.memo on child components.
const handleSelect = useCallback(
  (id: string) => setSelected(id),
  [] // No dependencies — function identity is stable
);
```

### useMemo — Cache expensive computations
```tsx
const filteredItems = useMemo(
  () => items.filter((item) => item.name.includes(search)).sort(compareFn),
  [items, search]
);
```

## Code Splitting & Lazy Loading
```tsx
import { lazy, Suspense } from "react";

// Split at route level
const AdminPanel = lazy(() => import("./pages/AdminPanel"));

// Split heavy components
const ChartWidget = lazy(() => import("./components/ChartWidget"));

function Dashboard() {
  return (
    <Suspense fallback={<Skeleton />}>
      <ChartWidget data={chartData} />
    </Suspense>
  );
}
```

## Virtualizing Long Lists
```bash
npm install @tanstack/react-virtual
```

```tsx
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";

function VirtualList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 5,
  });

  return (
    <div ref={parentRef} style={{ height: 400, overflow: "auto" }}>
      <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            style={{
              position: "absolute",
              top: virtualRow.start,
              height: virtualRow.size,
              width: "100%",
            }}
          >
            {items[virtualRow.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Image Optimization
```tsx
// Native lazy loading
<img src="/photo.jpg" alt="Description" loading="lazy" decoding="async" />

// Responsive images
<img
  srcSet="/photo-400.jpg 400w, /photo-800.jpg 800w, /photo-1200.jpg 1200w"
  sizes="(max-width: 600px) 400px, (max-width: 1024px) 800px, 1200px"
  src="/photo-800.jpg"
  alt="Description"
  loading="lazy"
/>
```

## Performance Checklist
1. Use React DevTools Profiler to find slow components.
2. Wrap pure display components in `React.memo`.
3. Stabilize callbacks with `useCallback` when passed to memoized children.
4. Lazy load routes and heavy components.
5. Virtualize lists with 50+ items.
6. Use `loading="lazy"` on images below the fold.
7. Avoid creating objects/arrays in JSX — define them outside or memoize.

## Anti-Patterns
- Do not wrap every component in `React.memo` — only where profiling shows waste.
- Do not use `useMemo`/`useCallback` for cheap operations — the overhead isn't worth it.
- Do not render 500+ DOM nodes at once — virtualize.
- Do not import entire icon libraries — use tree-shakeable imports.

## Changelog
- v1.0.0 — Initial release.
