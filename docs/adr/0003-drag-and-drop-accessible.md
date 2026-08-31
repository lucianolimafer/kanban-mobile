# ADR-003: Native drag-and-drop with an accessible alternative

- **Status:** Accepted
- **Date:** 2026-08-28

## Context

Dragging tasks is central to the demo, but a complex gesture cannot be the only way to move content. Persistence must not update on every animation frame either.

## Decision

Use Gesture Handler for recognition and Reanimated for visual feedback. Persist only the validated result at the end of the gesture. Expose gesture-free actions to move tasks between columns and change their order when applicable.

## Consequences

- Animation remains separate from transition and persistence rules.
- Invalid destinations and canceled gestures do not change the database.
- Screen-reader users and people who do not drag receive an equivalent operation.
- Automated tests cover the final rule; gesture ergonomics also require manual device testing.
