# Skill: SQL Query Skill
> @skillsforllms/sql-query-skill - v1.0.0 - Category: Backend

## Purpose
Guide an AI agent to turn plain-language data questions into safe, readable SQL queries with assumptions and verification notes.

## When to Use This Skill
- A user asks for a query in natural language.
- A dashboard needs aggregate, filter, join, or reporting SQL.
- A query needs to be optimized or explained.

## Tech Stack Decisions
| Concern | Choice | Reason |
| --- | --- | --- |
| SQL | Postgres-compatible by default | Strong baseline for modern apps. |
| Safety | Parameterized queries | Prevents injection in app code. |
| Performance | EXPLAIN-aware design | Encourages index-friendly queries. |

## Project Structure
```text
queries/
src/server/db/
migrations/
analytics/
```

## Key Conventions
- Ask for or infer table names, columns, and SQL dialect before writing final SQL.
- Use explicit column lists instead of SELECT * for application queries.
- Use parameter placeholders for user input.
- Explain assumptions and expected result shape.
- Suggest indexes when filters or joins need them.

## Step-by-Step Agent Instructions
1. Identify entities, metrics, filters, grouping, sorting, and limits.
2. Map the request to known schema names.
3. Write readable SQL with aliases and clear joins.
4. Add parameters for runtime values.
5. Include a short validation query or EXPLAIN note for complex queries.

## File Templates
```ts
SELECT u.id, u.email, COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE u.created_at >= $1
GROUP BY u.id, u.email
ORDER BY order_count DESC
LIMIT 20;
```

## Anti-Patterns
- Do not invent schema without labeling assumptions.
- Do not interpolate user input into raw SQL strings.
- Do not use SELECT * in production-facing examples.
- Do not ignore timezone boundaries in date filters.

## Examples
See `examples/basic/` for a minimal usage scenario.

## Changelog
- v1.0.0 - Initial free roadmap release.
