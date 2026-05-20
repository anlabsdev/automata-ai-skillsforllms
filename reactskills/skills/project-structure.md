# Skill: React Project Structure
> @skillsforllms/reactskills · v1.0.0 · Category: Web / React

## Purpose
Teach an AI agent to organize a React + TypeScript project for maintainability, scalability, and team collaboration.

## When to Use This Skill
- Starting a new React project from scratch.
- Refactoring a messy codebase into clear boundaries.
- Standardizing folder conventions across a team.

## Recommended Structure
```text
src/
  components/
    ui/                  # Reusable primitives (Button, Input, Modal, Spinner)
      Button.tsx
      Button.test.tsx
      Input.tsx
      Modal.tsx
    features/            # Feature-specific composed components
      auth/
        LoginForm.tsx
        SignupForm.tsx
      dashboard/
        StatsCard.tsx
        ActivityFeed.tsx
  hooks/                 # Custom hooks
    useAuth.ts
    useDebounce.ts
    useMediaQuery.ts
  lib/                   # Pure utilities and API clients
    api/
      client.ts          # Configured fetch/axios instance
      users.ts           # User API functions
      products.ts
    utils.ts             # Pure helper functions
    constants.ts
  pages/                 # Route-level page components (default exports)
    Home.tsx
    Dashboard.tsx
    Settings.tsx
    NotFound.tsx
  layouts/               # Layout wrappers with Outlet
    AppLayout.tsx
    AuthLayout.tsx
  stores/                # Zustand stores
    useCartStore.ts
    useUIStore.ts
  types/                 # Shared TypeScript types
    user.ts
    product.ts
    api.ts
  test/                  # Test utilities and setup
    setup.ts
    test-utils.tsx       # Custom render with providers
  styles/                # Global CSS
    globals.css
    variables.css
  App.tsx                # Router and provider setup
  main.tsx               # Entry point — ReactDOM.createRoot
```

## Naming Conventions
| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `UserCard.tsx` |
| Hooks | camelCase, `use` prefix | `useAuth.ts` |
| Utilities | camelCase | `formatDate.ts` |
| Types | PascalCase | `User`, `Product` |
| Stores | camelCase, `use` prefix | `useCartStore.ts` |
| Tests | Same name + `.test` | `UserCard.test.tsx` |
| Constants | UPPER_SNAKE_CASE | `API_BASE_URL` |

## Import Alias
Configure `@/` to point to `src/`:

```ts
// vite.config.ts
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
});
```

```json
// tsconfig.json (add to compilerOptions)
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  }
}
```

**Usage:**
```tsx
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { formatDate } from "@/lib/utils";
```

## Provider Stack (App.tsx)
```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
```

## Rules
1. Co-locate tests next to their source file.
2. Keep `components/ui/` framework-agnostic (no API calls, no routing).
3. API calls live in `lib/api/` only — never in components or hooks directly.
4. One component per file. No multi-component files.
5. Avoid deep nesting beyond 3 levels in any folder.

## Anti-Patterns
- Do not dump all components in a flat `components/` folder.
- Do not create `index.ts` barrel files that re-export everything.
- Do not put business logic in UI components.
- Do not use relative imports like `../../../hooks/useAuth`.

## Changelog
- v1.0.0 — Initial release.
