# Skill: React Testing Strategy
> @skillsforllms/reactskills · v1.0.0 · Category: Web / React

## Purpose
Teach an AI agent to write meaningful, maintainable tests for React applications using Vitest and Testing Library.

## When to Use This Skill
- Writing unit tests for hooks and utility functions.
- Writing integration tests for components with user interactions.
- Testing async data flows and error states.

## Setup
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

```ts
// vite.config.ts
export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    globals: true,
  },
});
```

```ts
// src/test/setup.ts
import "@testing-library/jest-dom/vitest";
```

## Component Test Template
```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Counter } from "./Counter";

describe("Counter", () => {
  it("renders initial count", () => {
    render(<Counter initialCount={5} />);
    expect(screen.getByText("Count: 5")).toBeInTheDocument();
  });

  it("increments on button click", async () => {
    const user = userEvent.setup();
    render(<Counter initialCount={0} />);
    await user.click(screen.getByRole("button", { name: /increment/i }));
    expect(screen.getByText("Count: 1")).toBeInTheDocument();
  });
});
```

## Query Priority (in order of preference)
1. `getByRole` — accessible role + name (best for a11y)
2. `getByLabelText` — form inputs
3. `getByPlaceholderText` — when no label exists
4. `getByText` — non-interactive text content
5. `getByTestId` — last resort only

## Testing Async Components
```tsx
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserList } from "./UserList";

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

it("shows users after loading", async () => {
  renderWithProviders(<UserList />);
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
  await waitFor(() => {
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });
});
```

## Testing Custom Hooks
```tsx
import { renderHook, act } from "@testing-library/react";
import { useCounter } from "./useCounter";

it("increments and decrements", () => {
  const { result } = renderHook(() => useCounter(0));
  expect(result.current.count).toBe(0);

  act(() => result.current.increment());
  expect(result.current.count).toBe(1);

  act(() => result.current.decrement());
  expect(result.current.count).toBe(0);
});
```

## What to Test vs What NOT to Test
| ✅ Test | ❌ Don't Test |
|---------|---------------|
| User interactions (clicks, typing) | Implementation details (state variables) |
| Rendered output (what user sees) | Internal component methods |
| Error states and loading states | CSS class names or styles |
| Form validation and submission | Third-party library internals |
| Accessibility (roles, labels) | Snapshot tests of large trees |

## Anti-Patterns
- Do not test implementation details — test behavior the user sees.
- Do not use `container.querySelector` — use Testing Library queries.
- Do not wrap every action in `act()` manually — `userEvent` handles it.
- Do not write snapshot tests for complex component trees.

## Changelog
- v1.0.0 — Initial release.
