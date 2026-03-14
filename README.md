# Movie Tickets Booking (User App)

A simple user-facing movie tickets booking app built with the same tech stack as the CMS booking frontend: **Vue 3**, **Vue Router**, **Vite**, **TypeScript**, and **Tailwind CSS**.

## Features

- **Browse movies** — Grid of now showing movies with poster, genre, duration
- **Movie detail** — View description and list of showtimes (theater, screen, time, price)
- **Select seats** — Interactive seat map; choose seats and enter name/email
- **Confirmation** — Booking summary and reference after checkout

The app talks to the same backend as the CMS (movies, theaters, showtimes, seats). Bookings use the **user-booking** service (default `http://localhost:8888`):

- `POST /api/v1/auth/login` — body `{ email, password }`; response should include a JWT (`token` or `access_token`) and user id (`id` or `user_id`) for bookings/profile.
- `POST /api/v1/auth/register` — body `{ full_name, email, password }`. If the response includes the same token + id shape as login, the app signs the user in immediately; otherwise they are sent to sign in.
- `POST /api/v1/bookings` — body `{ showtime_id, seat_keys, user_id }`
- `GET /api/v1/users/{userId}/bookings` — **booking history** for Profile (Bearer token sent when logged in)

Override base URL with `VITE_SHOWTIMES_SEATS_BASE_URL`. Login uses the same host unless you set `VITE_AUTH_BASE_URL`. History rows can be a JSON array or `{ "bookings": [...] }`. Each item is mapped flexibly (`id` / `booking_id`, `showtime_id`, `seat_keys`, `total_amount`, `status`, plus optional `movie_title`, `theater_name`, `screen_name`, `start_time`). Missing movie/theater/time are filled from CMS showtimes when possible.

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
