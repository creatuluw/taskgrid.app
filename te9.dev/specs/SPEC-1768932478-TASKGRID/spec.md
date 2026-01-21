# Spec: SPEC-1768932478-TASKGRID

## Status
State: IN_PROGRESS
Created: 2025-01-20T19:01:18Z
Updated: 2025-01-20T19:02:00Z

## Objective
Update TaskGrid page to match brutalist design exactly, including 50 demo tasks, simplified UI, and task type-based icons.

## Requirements
- Update TaskGrid.svelte to match brutalist design exactly
- Task numbers (01, 02, 03...) based on task creation order
- Task icons determined by task type (assigned to demo tasks)
- Simplify to match design exactly (remove edit, delete, toggle status, progress bar features)
- Generate 50 demo tasks with varied content and task types
- Add "delete demo data" button in bottom right corner
- Keep exact grid breakpoints (2, 4, 8, 12 columns) from design
- Maintain dark mode support and existing theme

## Acceptance Criteria
- [ ] Design matches provided HTML exactly (spacing, colors, fonts, icons)
- [ ] Tasks numbered sequentially by creation order
- [ ] 50 demo tasks generated with appropriate icons based on type
- [ ] Demo data can be deleted with button in bottom right
- [ ] Grid responsive at all breakpoints
- [ ] Dark mode works correctly
- [ ] Simplified UI (no edit/delete/toggle features on cards)

## Context
**Original Prompt:** change our taskgrid page to exactly this design: [provided HTML]
**Clarification Questions Asked:** 5
**Key Decisions:**
- Task numbers based on creation order
- Task icons determined by task type
- Simplify UI to match design exactly
- Generate 50 demo tasks
- Add delete demo data button
- Keep exact grid breakpoints

## Technical Notes
- Task types to be determined based on content/prompt analysis
- Material Icons library for task icons
- Tailwind CSS for styling
- Responsive breakpoints: 2 (mobile), 4 (sm), 8 (md), 12 (lg) columns
