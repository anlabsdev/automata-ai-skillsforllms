# Skill: React State Management
> @skillsforllms/reactskills · v1.0.0 · Category: Web / React

## Purpose
Teach an AI agent to choose and implement the right state management approach for each situation — local state, context, Zustand, and server state with TanStack Query.

## When to Use This Skill
- Deciding between local state, context, and external stores.
- Setting up Zustand for global client state.
- Managing server state with TanStack Query.
- Avoiding common state architecture mistakes.

## State Decision Tree

```text
Is the state server-owned data?
  YES → Use TanStack Query (or SWR)
  NO → Is it used by only one component?
    YES → useState or useReducer
    NO → Is it used by 2-3 nearby components?
      YES → Lift state up to the nearest common parent
      NO → Is it a simple value (theme, locale, auth)?
        YES → React Context
        NO → Use Zustand (global client store)
```

## 1. Local State — useState / useReducer

Use for state that belongs to a single component or a small subtree.

```tsx
// Simple toggle
const [isOpen, setIsOpen] = useState(false);

// Complex local state — useReducer
interface FormState {
  name: string;
  email: string;
  errors: Record<string, string>;
  isSubmitting: boolean;
}

type FormAction =
  | { type: "SET_FIELD"; field: string; value: string }
  | { type: "SET_ERRORS"; errors: Record<string, string> }
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_END" };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value, errors: {} };
    case "SET_ERRORS":
      return { ...state, errors: action.errors, isSubmitting: false };
    case "SUBMIT_START":
      return { ...state, isSubmitting: true };
    case "SUBMIT_END":
      return { ...state, isSubmitting: false };
  }
}
```

## 2. React Context — Cross-Cutting Concerns

Use for values that rarely change and are needed deep in the tree (theme, auth, locale).

```tsx
import { createContext, useContext, useState, type ReactNode } from "react";

interface ThemeContextValue {
  theme: "light" | "dark";
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const toggle = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

**Context Rules:**
- ✅ Use for auth user, theme, locale, feature flags.
- ❌ Never use for rapidly changing values (mouse position, scroll offset).
- ❌ Never use as a "global store" for all app state — it re-renders all consumers.

## 3. Zustand — Global Client State

Use for client-owned state shared across many unrelated components.

```tsx
// src/stores/useCartStore.ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  devtools(
    persist(
      (set, get) => ({
        items: [],

        addItem: (item) =>
          set((state) => {
            const existing = state.items.find((i) => i.id === item.id);
            if (existing) {
              return {
                items: state.items.map((i) =>
                  i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                ),
              };
            }
            return { items: [...state.items, { ...item, quantity: 1 }] };
          }),

        removeItem: (id) =>
          set((state) => ({
            items: state.items.filter((i) => i.id !== id),
          })),

        updateQuantity: (id, quantity) =>
          set((state) => ({
            items: state.items.map((i) =>
              i.id === id ? { ...i, quantity: Math.max(0, quantity) } : i
            ),
          })),

        clearCart: () => set({ items: [] }),

        totalPrice: () =>
          get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      }),
      { name: "cart-storage" }
    )
  )
);
```

**Usage in components:**
```tsx
function CartBadge() {
  // Only subscribes to items.length — won't re-render for other changes
  const itemCount = useCartStore((state) => state.items.length);
  return <span className="badge">{itemCount}</span>;
}

function CartTotal() {
  const totalPrice = useCartStore((state) => state.totalPrice());
  return <span>${totalPrice.toFixed(2)}</span>;
}
```

**Zustand Best Practices:**
1. Use **selectors** to subscribe to only what you need — prevents unnecessary re-renders.
2. Keep **one store per domain** (cart, user preferences, UI state) — not one mega-store.
3. Use **`persist` middleware** for data that survives page refresh.
4. Use **`devtools` middleware** for debugging in development.

## 4. TanStack Query — Server State

Use for any data that comes from an API and has a lifecycle (loading, error, stale, refetch).

```tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Fetch
export function useProducts(category?: string) {
  return useQuery({
    queryKey: ["products", { category }],
    queryFn: async () => {
      const params = category ? `?category=${category}` : "";
      const res = await fetch(`/api/products${params}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json() as Promise<Product[]>;
    },
    staleTime: 5 * 60 * 1000,  // 5 minutes
    gcTime: 30 * 60 * 1000,    // 30 minutes
  });
}

// Mutate + invalidate
export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newProduct: CreateProductDTO) =>
      fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
```

## Anti-Patterns
- ❌ Do not store server data in `useState` and manually sync with `useEffect`.
- ❌ Do not put everything in one giant React Context provider.
- ❌ Do not use Redux for new projects unless you have an existing Redux codebase.
- ❌ Do not forget selectors with Zustand — subscribing to the whole store defeats the purpose.
- ❌ Do not mix client state and server state in the same store.

## Changelog
- v1.0.0 — Initial release.
