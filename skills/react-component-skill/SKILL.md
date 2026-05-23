# Skill: React Component Skill
> @skillsforllms/react-component-skill - v1.0.0 - Category: Web

## Purpose
Guide an AI agent to turn a user description into a clean, typed, accessible React component that fits the existing project.

## When to Use This Skill
- A user asks for a reusable React component from a plain description.
- A feature needs a presentational component, form section, card, table row, or interactive widget.
- The project needs component props, states, and examples produced together.

## Tech Stack Decisions
| Concern | Choice | Reason |
| --- | --- | --- |
| Language | TypeScript | Keeps props and states explicit. |
| Rendering | React function components | Matches modern React projects. |
| Styling | Existing project style first | Avoids forcing a new design system. |

## Project Structure
```text
src/components/ui/
src/components/features/
src/stories/
src/tests/
```

## Key Conventions
- Start by inspecting nearby components and naming conventions.
- Define a small props interface before writing JSX.
- Include loading, empty, error, disabled, and focus states when relevant.
- Use semantic HTML and keyboard-friendly interactions.
- Export components by name unless the local project already uses defaults.

## Step-by-Step Agent Instructions
1. Restate the component purpose, data inputs, states, and actions.
2. Find the closest existing component pattern before creating new structure.
3. Write the component with typed props and minimal internal state.
4. Add accessible labels, roles, and focus behavior for interactive controls.
5. Add a compact usage example or focused test when the component has behavior.

## File Templates
```ts
export interface UserCardProps {
  name: string;
  role?: string;
  onOpen?: () => void;
}

export function UserCard({ name, role, onOpen }: UserCardProps) {
  return (
    <article className="rounded-md border p-4">
      <h3>{name}</h3>
      {role ? <p>{role}</p> : null}
      {onOpen ? <button type="button" onClick={onOpen}>Open</button> : null}
    </article>
  );
}
```

## Anti-Patterns
- Do not create a component before checking the existing styling system.
- Do not use any for props.
- Do not hide required behavior inside untyped object props.
- Do not ship click-only interactions without keyboard access.

## Examples
See `examples/basic/` for a minimal usage scenario.

## Changelog
- v1.0.0 - Initial free roadmap release.
