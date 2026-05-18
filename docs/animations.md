# Animation System

This document describes the animation and transition strategy used in the persona explorer.

## Core Principles

- **Accessibility First**: All animations respect `prefers-reduced-motion`.
- **Native Performance**: We prefer the View Transitions API when available.
- **Centralized Control**: Animation primitives live in `lib/animations.ts`.
- **Progressive Enhancement**: Graceful fallback when View Transitions are not supported.

## Key Files

| File | Purpose |
|------|---------|
| `lib/animations.ts` | Centralized hook, transition names, durations, and easing |
| `hooks/useViewTransition.ts` | Core hook (re-exported from `lib/animations.ts`) |
| `src/components/persona/PersonaCard.tsx` | Triggers transitions on card selection |
| `src/components/persona/PersonaDetailPanel.tsx` | Panel open/close + focus management + loading skeleton |
| `src/components/persona/PersonaCompareBar.tsx` | Transitions when adding/removing from compare |

## Usage

```tsx
import { useViewTransition, TRANSITION_NAMES } from '@/lib/animations';

const { startViewTransition } = useViewTransition();

startViewTransition(() => {
  // update state here
  setSelectedPersona(persona);
});
```

## Transition Names

```ts
export const TRANSITION_NAMES = {
  personaCard: 'persona-card',
  personaPanel: 'persona-panel',
  personaBackdrop: 'persona-backdrop',
};
```

## Accessibility Rules

- When `prefers-reduced-motion: reduce` is active, all custom animations are disabled.
- Focus management is always active (independent of motion preference).
- View Transitions automatically become instant under reduced motion.

## Adding New Transitions

1. Add a new entry to `TRANSITION_NAMES` in `lib/animations.ts` if needed.
2. Use `startViewTransition()` when changing relevant state.
3. Apply `viewTransitionName` style to the elements involved.
4. Test both with and without reduced motion enabled.

## Future Improvements

- Expand usage to more components
- Add shared element transitions between compare mode and detail view
- Consider extracting a small motion design system
