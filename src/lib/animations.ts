import { useViewTransition } from "@/hooks/useViewTransition";

export { useViewTransition };

export const TRANSITION_NAMES = {
  personaCard:     "persona-card",
  personaPanel:    "persona-panel",
  personaBackdrop: "persona-backdrop",
} as const;

export type TransitionName = (typeof TRANSITION_NAMES)[keyof typeof TRANSITION_NAMES];

export const DURATIONS = {
  fast:   150,
  normal: 250,
  slow:   350,
} as const;

export const EASING = {
  standard:  "cubic-bezier(0.32, 0.72, 0, 1)",
  emphasized: "cubic-bezier(0.2, 0, 0, 1)",
} as const;
