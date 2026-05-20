# Skill: React Component Patterns
> @skillsforllms/reactskills · v1.0.0 · Category: Web / React

## Purpose
Teach an AI agent to write clean, composable, and maintainable React components using modern patterns — compound components, render props, polymorphic components, and proper prop design.

## When to Use This Skill
- Creating new UI components (buttons, cards, modals, dropdowns).
- Building a reusable component library or design system.
- Refactoring large monolithic components into composable parts.
- Deciding between controlled vs uncontrolled component APIs.

## Component Anatomy

### Functional Component Template
```tsx
import { type ReactNode } from "react";

interface CardProps {
  title: string;
  children: ReactNode;
  variant?: "default" | "outlined" | "elevated";
  className?: string;
}

export function Card({
  title,
  children,
  variant = "default",
  className = "",
}: CardProps) {
  return (
    <div className={`card card--${variant} ${className}`}>
      <h3 className="card__title">{title}</h3>
      <div className="card__body">{children}</div>
    </div>
  );
}
```

### Key Rules
1. **Always type props** with an `interface` — never use `any` or inline object types.
2. **Use named exports** for components. Default exports only for route-level pages if the router requires them.
3. **Destructure props** in the function signature with default values.
4. **Spread `className`** — always accept and merge an optional `className` prop for consumer customization.
5. **Avoid prop drilling** beyond 2 levels — use Context or composition instead.

## Compound Component Pattern
Use when a component has tightly related sub-components (e.g., `Tabs`, `Accordion`, `Menu`).

```tsx
import { createContext, useContext, useState, type ReactNode } from "react";

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("Tab components must be used within <Tabs>");
  return ctx;
}

export function Tabs({ defaultTab, children }: { defaultTab: string; children: ReactNode }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div role="tablist">{children}</div>
    </TabsContext.Provider>
  );
}

export function TabTrigger({ value, children }: { value: string; children: ReactNode }) {
  const { activeTab, setActiveTab } = useTabsContext();
  return (
    <button
      role="tab"
      aria-selected={activeTab === value}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
}

export function TabContent({ value, children }: { value: string; children: ReactNode }) {
  const { activeTab } = useTabsContext();
  if (activeTab !== value) return null;
  return <div role="tabpanel">{children}</div>;
}
```

**Usage:**
```tsx
<Tabs defaultTab="overview">
  <TabTrigger value="overview">Overview</TabTrigger>
  <TabTrigger value="settings">Settings</TabTrigger>
  <TabContent value="overview">Overview content here.</TabContent>
  <TabContent value="settings">Settings content here.</TabContent>
</Tabs>
```

## Polymorphic Component Pattern
Use when a component needs to render as different HTML elements or other components.

```tsx
import { type ElementType, type ComponentPropsWithoutRef } from "react";

type ButtonProps<T extends ElementType = "button"> = {
  as?: T;
  variant?: "primary" | "secondary" | "ghost";
} & ComponentPropsWithoutRef<T>;

export function Button<T extends ElementType = "button">({
  as,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps<T>) {
  const Component = as || "button";
  return <Component className={`btn btn--${variant} ${className}`} {...props} />;
}
```

**Usage:**
```tsx
<Button>Click me</Button>
<Button as="a" href="/docs">Read Docs</Button>
<Button as={Link} to="/settings">Settings</Button>
```

## Controlled vs Uncontrolled Components
| Pattern | When to Use | Example |
| --- | --- | --- |
| **Controlled** | Parent needs to know/control the value at all times | Form inputs, search bars |
| **Uncontrolled** | Value is only needed on submit, or for performance | File inputs, complex editors |

```tsx
// Controlled — parent owns the state
interface InputProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
}

export function Input({ value, onChange, label }: InputProps) {
  return (
    <label>
      {label}
      <input value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}
```

## Anti-Patterns
- ❌ Do not use `React.FC` — it adds implicit `children` and breaks generic components.
- ❌ Do not use `index.tsx` barrel files that re-export everything — they defeat tree-shaking.
- ❌ Do not create "god components" with 200+ lines — split into composition.
- ❌ Do not use string enums for variant props — use union literal types instead.
- ❌ Do not mix layout and business logic in the same component.

## Changelog
- v1.0.0 — Initial release.
