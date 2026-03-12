# Movie Tickets Booking (User App)

A simple user-facing movie tickets booking app built with the same tech stack as the CMS booking frontend: **Vue 3**, **Vue Router**, **Vite**, **TypeScript**, and **Tailwind CSS**.

## Features

- **Browse movies** — Grid of now showing movies with poster, genre, duration
- **Movie detail** — View description and list of showtimes (theater, screen, time, price)
- **Select seats** — Interactive seat map; choose seats and enter name/email
- **Confirmation** — Booking summary and reference after checkout

The app talks to the same backend as the CMS (movies, theaters, showtimes, seats). If the backend exposes `POST /api/bookings`, real bookings are created; otherwise a mock confirmation is returned so you can demo the full flow.

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

Runs at `http://localhost:5173` (or next free port). Set `VITE_API_BASE_URL` if your API is not at `http://localhost:8080`.

## Build

```bash
npm run build
npm run preview   # preview production build
```

## Project structure

- `src/views/` — Home, MovieDetail, SeatPick, BookingConfirmation
- `src/api/` — HTTP client and API client (movies, showtimes, seats, booking)
- `src/components/` — Layout (Header), UI (Button, Card, Input, Toast)
- `src/router/` — Routes for home, movie detail, seat pick, confirmation

## Tech stack

- Vue 3 (Composition API, `<script setup>`)
- Vue Router 4
- Vite 6
- TypeScript
- Tailwind CSS (same cinema theme as CMS)
