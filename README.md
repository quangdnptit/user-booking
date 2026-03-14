# Movie Tickets Booking (User App)

Vue 3 + Vite + TypeScript + Tailwind. **All HTTP calls go to one API** — default **`http://localhost:8888`** (`VITE_API_BASE_URL`).

## API base

| Env | Default |
|-----|--------|
| `VITE_API_BASE_URL` | `http://localhost:8888` |

Used for:

- **CMS-style routes** (via `http` client): `/api/movies`, `/api/showtimes`, `/api/theaters`, `/api/seats/room/:id`, `/api/bookings`, etc.
- **Auth**: `POST /api/v1/auth/login`, `POST /api/v1/auth/register`
- **Bookings**: `POST /api/v1/bookings` — `{ showtime_id, seat_keys, user_id }`
- **Seats**: `GET /showtimes/:showtimeId/seats`
- **History**: `GET /api/v1/users/:userId/bookings`

Copy `.env.example` to `.env` if you need another host.

## Setup

```bash
npm install
cp .env.example .env   # optional
npm run dev
```

App runs at `http://localhost:5173` (or next free port).

## Build

```bash
npm run build
npm run preview
```

## Tech stack

Vue 3, Vue Router 4, Vite 6, TypeScript, Tailwind CSS.
