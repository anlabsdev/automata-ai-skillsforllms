# Skill: React Routing & Navigation
> @skillsforllms/reactskills · v1.0.0 · Category: Web / React

## Purpose
Teach an AI agent to set up client-side routing with React Router v6+, including nested routes, protected routes, lazy loading, and navigation patterns.

## When to Use This Skill
- Adding multi-page navigation to a React SPA.
- Implementing protected/authenticated routes.
- Setting up nested layouts with shared headers/sidebars.

## Basic Router
```tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

const Home = lazy(() => import("./pages/Home"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));

export function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<AuthGuard />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/users/:userId" element={<UserProfile />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

## Protected Route
```tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";

export function AuthGuard() {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
}
```

## Navigation Hooks
```tsx
const { userId } = useParams<{ userId: string }>();
const navigate = useNavigate();
const [searchParams, setSearchParams] = useSearchParams();
const location = useLocation();
```

## Anti-Patterns
- Do not use `window.location.href` for internal navigation.
- Do not skip lazy loading for large pages.
- Do not store route state in global state — use URL params instead.

## Changelog
- v1.0.0 — Initial release.
