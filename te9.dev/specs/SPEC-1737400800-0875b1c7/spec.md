# Spec: SPEC-1737400800-0875b1c7

## Status
State: IN_PROGRESS
Created: 2025-01-20T19:20:00Z
Updated: 2025-01-20T19:22:00Z

## Objective
Convert existing Svelte Vite task manager to SvelteKit 2, copying design from design/task-grid.html and implementing SQLite backend for data persistence.

## Requirements
1. Convert from Svelte Vite to SvelteKit 2 framework
2. Copy all markup logic and styling from design/task-grid.html
3. Build SQLite backend for data persistence
4. Setup Tailwind CSS as dev dependency (replace CDN approach)
5. Display task grid on root URL (/)
6. Replace localStorage with SQLite database storage
7. Implement server-side routes for task CRUD operations
8. Maintain brutalist design aesthetic from reference design

## Acceptance Criteria
- [ ] SvelteKit 2 project initialized with proper configuration
- [ ] src/routes/+page.svelte created with task grid markup from design/task-grid.html
- [ ] Tailwind CSS configured as dev dependency (not CDN)
- [ ] SQLite database schema created for tasks
- [ ] Server endpoints implemented: GET /api/tasks, POST /api/tasks, DELETE /api/tasks/:id
- [ ] Dark mode logic implemented respecting system preferences
- [ ] Responsive grid layout matching original design (2/4/8/12 columns)
- [ ] Material Icons and Space Mono font properly integrated
- [ ] Home route (/) displays task grid correctly
- [ ] Tasks can be created, read, and deleted via SQLite
- [ ] Demo data seeded from design file (29 tasks + New Entry button)
- [ ] All styling matches brutalist grid design (sharp corners, hover effects, shadows)

## Context
**Original Prompt:** "i want to build an official svelte 5 app, you need to copy all logic from the design example: @design\task-grid.html into a +page.svelte page in src/routes and make sure this page is going to show up on the home route"

**Clarification Questions Asked:** 5
- Framework choice: SvelteKit (confirmed)
- Scope of changes: Copy markup and styling, build backend (confirmed)
- Design implementation: Use dev dependency for Tailwind (confirmed)
- Home route: Root URL / (confirmed)
- Data persistence: Use SQLite (confirmed)

**Key Decisions:**
- Migrate from Svelte Vite to SvelteKit 2
- Port all design elements from design/task-grid.html exactly
- Replace localStorage with SQLite database
- Use proper Tailwind setup instead of CDN
- Implement server-side API routes for CRUD operations

## Technical Notes
- Current project has: Svelte 5, Vite, Tailwind 4.1.18, better-sqlite3
- Design uses brutalist grid pattern with Space Mono font
- Dark mode should respect system preferences
- Grid layout: 2 columns (mobile) → 4 (sm) → 8 (md) → 12 (lg)
- Material Icons library required
- Tasks have: id, title, type, status, created_at, updated_at
- Database needs tasks table with proper schema
