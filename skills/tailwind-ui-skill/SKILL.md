# Skill: Tailwind UI Skill
> @skillsforllms/tailwind-ui-skill - v1.0.0 - Category: Web

## Purpose
Guide an AI agent to build polished Tailwind UI blocks that respect an existing app theme and are ready to paste.

## When to Use This Skill
- A user asks for a navbar, card grid, modal, button set, pricing panel, or app shell.
- A project needs Tailwind classes organized into reusable components.
- A UI needs responsive states without introducing a new component library.

## Tech Stack Decisions
| Concern | Choice | Reason |
| --- | --- | --- |
| Styling | Tailwind CSS | Fast composition and predictable tokens. |
| Components | React or HTML | Use the host project's framework. |
| Icons | Project icon library | Keeps visual language consistent. |

## Project Structure
```text
src/components/ui/
src/components/layout/
src/components/marketing/
```

## Key Conventions
- Use existing theme tokens and utility patterns before inventing new colors.
- Keep component APIs small and practical.
- Add responsive variants for mobile, tablet, and desktop.
- Use accessible dialog, menu, and button semantics.
- Prefer composition over long one-off class strings repeated in many files.

## Step-by-Step Agent Instructions
1. Identify the UI block type and required states.
2. Inspect project Tailwind config and existing component primitives.
3. Write the smallest reusable component that covers the requested block.
4. Add hover, focus-visible, disabled, and responsive behavior.
5. Return paste-ready code plus a short usage snippet.

## File Templates
```ts
export function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="inline-flex items-center justify-center rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 disabled:opacity-50"
    />
  );
}
```

## Anti-Patterns
- Do not paste inaccessible modal or dropdown markup.
- Do not use random color palettes that ignore the app theme.
- Do not make every block a marketing hero.
- Do not duplicate the same long class recipe without extracting a primitive.

## Examples
See `examples/basic/` for a minimal usage scenario.

## Changelog
- v1.0.0 - Initial free roadmap release.
