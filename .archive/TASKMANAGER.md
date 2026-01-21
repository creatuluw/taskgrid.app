# Task Manager

A brutalist task manager built with Svelte and SQLite.

## Features

- Create, edit, and delete tasks
- Mark tasks as completed/pending
- Brutalist grid design inspired by the provided design
- SQLite database for persistent storage
- Dark mode support

## Setup

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:3000`

## Database

Tasks are stored in `tasks.db` using SQLite with the following schema:

- `id`: Unique identifier
- `title`: Task title
- `description`: Task description
- `status`: Task status (pending/completed)
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp
