# Skill: Node REST API
> @skillsforllms/node-rest-api · v1.0.0 · Category: Backend / Node.js

## Purpose
Guide an AI agent to build secure, testable Node.js REST APIs with TypeScript, route modules, request validation, authentication boundaries, and centralized error handling.

## When to Use This Skill
- Creating an Express or Fastify REST API.
- Adding endpoints to an existing Node backend.
- Introducing request validation, auth middleware, or OpenAPI docs.
- Refactoring controller-heavy APIs into service boundaries.

## Tech Stack Decisions
| Concern | Choice | Reason |
| --- | --- | --- |
| Runtime | Node.js LTS | Stable production baseline. |
| Language | TypeScript | Safer API contracts. |
| Validation | Zod | Runtime validation and inferred types. |
| Tests | Vitest + Supertest | Fast endpoint verification. |
| Docs | OpenAPI | Shareable API contract. |

## Project Structure
```text
src/
  app.ts
  server.ts
  routes/
  services/
  repositories/
  middleware/
  schemas/
  tests/
```

## Key Conventions
- Routes parse HTTP concerns and delegate business behavior to services.
- Validate `params`, `query`, and `body` before calling service code.
- Return consistent error envelopes with status codes and safe messages.
- Keep secrets in environment variables and validate env at startup.
- Write integration tests for every new route group.

## Step-by-Step Agent Instructions
1. Identify the route group and data ownership boundary.
2. Add or update Zod schemas before endpoint logic.
3. Implement service behavior without direct access to request/response objects.
4. Wire route handlers and middleware.
5. Add integration tests covering success and validation failure cases.

## File Templates
```ts
export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
  };
};
```

## Anti-Patterns
- Do not put database queries directly in route handlers.
- Do not trust request input without schema validation.
- Do not leak stack traces, tokens, or raw database errors to clients.
- Do not mix authentication, authorization, and business logic in one function.

## Examples
See `examples/basic/` for a minimal route/service/schema layout.

## Changelog
- v1.0.0 - Initial release.
