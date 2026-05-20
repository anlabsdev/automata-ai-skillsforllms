# Skill: Auth Setup
> @skillsforllms/auth-setup · v1.0.0 · Category: Security / Auth

## Purpose
Guide an AI agent to implement authentication and authorization flows with clear trust boundaries, safe session handling, role checks, and protected routes.

## When to Use This Skill
- Adding sign-in, sign-up, logout, session, or account flows.
- Protecting routes, API endpoints, or database records.
- Designing role-based or permission-based access control.
- Reviewing an app for common auth security mistakes.

## Tech Stack Decisions
| Concern | Choice | Reason |
| --- | --- | --- |
| Identity | Managed provider when possible | Reduces custom password and session risk. |
| Authorization | Server-side checks | Prevents client-only access control bypasses. |
| Sessions | HttpOnly secure cookies | Limits token exposure to scripts. |
| Validation | Schema validation | Defends every auth boundary. |

## Project Structure
```text
src/
  lib/auth/
  middleware/
  routes/
  components/auth/
  tests/auth/
```

## Key Conventions
- Authentication proves identity; authorization decides access. Keep both explicit.
- Enforce permissions on the server for every protected mutation or data read.
- Store sensitive tokens in HttpOnly, Secure, SameSite cookies when using browser sessions.
- Keep role and permission definitions centralized.
- Log auth failures without leaking secrets or user enumeration clues.

## Step-by-Step Agent Instructions
1. Identify protected resources, roles, and ownership rules.
2. Choose the provider or existing auth library before writing custom code.
3. Add server-side guards for pages, APIs, and data access.
4. Add client UI states for loading, unauthenticated, forbidden, and signed-in views.
5. Test login, logout, forbidden access, expired session, and privilege escalation attempts.

## File Templates
```ts
export type Role = "owner" | "admin" | "member";

export function canManageWorkspace(role: Role): boolean {
  return role === "owner" || role === "admin";
}
```

## Anti-Patterns
- Do not rely on hidden buttons or client checks as authorization.
- Do not store long-lived tokens in localStorage unless explicitly required and risk accepted.
- Do not reveal whether an email exists during password reset or sign-in failures.
- Do not duplicate permission logic across unrelated files.

## Examples
See `examples/basic/` for a minimal role and guard model.

## Changelog
- v1.0.0 - Initial release.
