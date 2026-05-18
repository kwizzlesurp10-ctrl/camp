/**
 * Animation & Transition Primitives
 * Centralized place for View Transitions, durations, and accessibility-aware helpers.
 */

import { useViewTransition } from "@/hooks/useViewTransition";

export { useViewTransition };

/**
 * Named view transitions used across the persona explorer.
 * These enable smooth shared-element transitions between components.
 */
export const TRANSITION_NAMES = {
  personaCard: "persona-card",
  personaPanel: "persona-panel",
  personaBackdrop: "persona-backdrop",
} as const;

export type TransitionName = (typeof TRANSITION_NAMES)[keyof typeof TRANSITION_NAMES];

/**
 * Recommended durations (in ms) for consistent motion language.
 * Use these when building new transitions.
 */
export const DURATIONS = {
  fast: 150,
  normal: 250,
  slow: 350,
} as const;

/**
 * Easing curves for natural motion.
 */
export const EASING = {
  standard: "cubic-bezier(0.32, 0.72, 0, 1)",
  emphasized: "cubic-bezier(0.2, 0, 0, 1)",
} as const;
