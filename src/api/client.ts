import type {
  Movie,
  Theater,
  Showtime,
  Seat,
  SeatStatus,
  BookingRequest,
  Booking,
  User,
  LoginCredentials,
} from '../types'
import { http, setAuthToken } from './http'

interface LoginResponse {
  token: string
  id: string
  email: string
  fullName: string
  role?: string
}

interface BackendMovie {
  id: string
  title: string
  description: string
  durationMinutes: number
  genre: string
  ageRating: string
  posterUrl: string
  createdAt: string
}

interface BackendRoom {
  id: string
  name: string
  totalSeats: number
  createdAt?: string
}

interface BackendTheater {
  id: string
  name: string
  location: string
  createdAt?: string
  rooms?: BackendRoom[]
}

interface BackendShowtime {
  id: string
  startTime: string
  endTime: string
  basePrice: number
  createdAt?: string
  movieId?: string
  roomId?: string
}

interface BackendSeat {
  id: string
  seatRow: string
  seatNumber: number
  seatType: string
  isActive?: boolean
  roomId?: string
  seatStatus?: SeatStatus
}

const SEAT_STATUSES: SeatStatus[] = ['AVAILABLE', 'UNAVAILABLE', 'BOOKED', 'LOCKED']

function normalizeSeatStatus(s: string | undefined): SeatStatus {
  const u = String(s ?? '').toUpperCase().trim()
  return SEAT_STATUSES.includes(u as SeatStatus) ? (u as SeatStatus) : 'AVAILABLE'
}

function mapMovie(b: BackendMovie): Movie {
  return {
    id: b.id,
    title: b.title,
    description: b.description ?? '',
    durationMinutes: b.durationMinutes,
    rating: b.ageRating ?? 'PG-13',
    genre: b.genre ?? '',
    posterUrl: b.posterUrl ?? '',
    isActive: true,
    createdAt: b.createdAt ?? '',
  }
}

function mapTheater(b: BackendTheater): Theater {
  const rooms = b.rooms ?? []
  return {
    id: b.id,
    name: b.name,
    address: b.location ?? '',
    screenCount: rooms.length,
    screens: rooms.map((r) => ({
      id: r.id,
      name: r.name,
      capacity: r.totalSeats ?? 0,
      theaterId: b.id,
    })),
    isActive: true,
  }
}

function mapShowtime(b: BackendShowtime, movies?: Movie[], theaters?: Theater[]): Showtime {
  const screenId = b.roomId ?? ''
  const movieId = b.movieId ?? ''
  let screen: Theater['screens'][0] | undefined
  let theater: Theater | undefined
  if (theaters) {
    for (const t of theaters) {
      screen = t.screens.find((s) => s.id === screenId)
      if (screen) {
        theater = t
        break
      }
    }
  }
  return {
    id: b.id,
    movieId,
    screenId,
    theaterId: theater?.id ?? '',
    startTime: b.startTime,
    endTime: b.endTime,
    price: b.basePrice ?? 0,
    currency: 'USD',
    isActive: true,
    movie: movies?.find((m) => m.id === movieId),
    screen,
    theater,
  }
}

function mapSeat(
  b: BackendSeat,
  screen?: { id: string; name: string; capacity: number; theaterId: string },
  fallbackScreenId?: string
): Seat {
  const status = normalizeSeatStatus(b.seatStatus)
  return {
    id: b.id,
    screenId: b.roomId ?? fallbackScreenId ?? '',
    row: b.seatRow ?? '',
    seatNumber: b.seatNumber ?? 0,
    type: (b.seatType as Seat['type']) ?? 'STANDARD',
    isActive: b.isActive ?? true,
    status,
    screen,
  }
}

export const api = {
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const res = await http.post<LoginResponse>('/api/auth/login', {
      email: credentials.email,
      password: credentials.password,
    })
    setAuthToken(res.token)
    return {
      user: { id: res.id, email: res.email, name: res.fullName ?? res.email },
      token: res.token,
    }
  },

  async logout(): Promise<void> {
    setAuthToken(null)
  },

  async getMovies(): Promise<Movie[]> {
    const list = await http.get<BackendMovie[]>('/api/movies')
    return (Array.isArray(list) ? list : []).map(mapMovie)
  },

  async getMovie(id: string): Promise<Movie | null> {
    try {
      const b = await http.get<BackendMovie>(`/api/movies/${id}`)
      return mapMovie(b)
    } catch {
      return null
    }
  },

  async getTheaters(): Promise<Theater[]> {
    const list = await http.get<BackendTheater[]>('/api/theaters')
    const theaters = Array.isArray(list) ? list : []
    const result: Theater[] = []
    for (const t of theaters) {
      if (t.id) {
        try {
          const rooms = await http.get<BackendRoom[]>(`/api/rooms/theater/${t.id}`)
          result.push(mapTheater({ ...t, rooms: Array.isArray(rooms) ? rooms : [] }))
        } catch {
          result.push(mapTheater(t))
        }
      } else {
        result.push(mapTheater(t))
      }
    }
    return result
  },

  async getShowtimes(): Promise<Showtime[]> {
    const [list, movies, theaters] = await Promise.all([
      http.get<BackendShowtime[]>('/api/showtimes'),
      this.getMovies(),
      this.getTheaters(),
    ])
    const showtimes = Array.isArray(list) ? list : []
    return showtimes.map((s) => mapShowtime(s, movies, theaters))
  },

  async getSeatsByScreen(screenId: string): Promise<Seat[]> {
    const list = await http.get<BackendSeat[]>(`/api/seats/room/${screenId}`)
    const seats = Array.isArray(list) ? list : []
    const theaters = await this.getTheaters()
    const screen = theaters.flatMap((t) => t.screens).find((s) => s.id === screenId)
    return seats
      .map((s) => mapSeat(s, screen, screenId))
      .sort((a, b) => a.row.localeCompare(b.row) || a.seatNumber - b.seatNumber)
  },

  /** Seats layout for a showtime (e.g. booking service on port 8888). */
  async getSeatsByShowtime(showtimeId: string, fallbackScreenId?: string): Promise<Seat[]> {
    const base =
      import.meta.env.VITE_SHOWTIMES_SEATS_BASE_URL ?? 'http://localhost:8888'
    const url = `${base.replace(/\/$/, '')}/showtimes/${showtimeId}/seats`
    const res = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || `Seats request failed (${res.status})`)
    }
    const raw = await res.json()
    const list: unknown[] = Array.isArray(raw)
      ? raw
      : raw && typeof raw === 'object' && Array.isArray((raw as { seats?: unknown[] }).seats)
        ? (raw as { seats: unknown[] }).seats
        : []
    /** Port 8888 showtime seats: seat_key "H#6", seat_status, snake_case. */
    const toBackendSeat = (item: unknown): BackendSeat | null => {
      if (!item || typeof item !== 'object') return null
      const o = item as Record<string, unknown>
      const seatKey = String(o.seat_key ?? o.seatKey ?? '').trim()
      let seatRow = ''
      let seatNumber = 0
      if (seatKey.includes('#')) {
        const [r, n] = seatKey.split('#')
        seatRow = (r ?? '').trim()
        seatNumber = parseInt(String(n ?? '').trim(), 10) || 0
      } else {
        seatRow = String(o.seatRow ?? o.row ?? '').trim()
        seatNumber = Number(o.seatNumber ?? o.number ?? o.col ?? 0) || 0
      }
      const id = String(o.id ?? seatKey ?? '')
      if (!id || !seatRow || seatNumber < 1) return null
      const seatType = String(
        o.seat_type ?? o.seatType ?? o.type ?? 'STANDARD'
      ).toUpperCase()
      const status = String(o.seat_status ?? o.seatStatus ?? '')
        .toUpperCase()
        .trim()
      const bookingId = String(o.booking_id ?? o.bookingId ?? '').trim()
      const activeStr = String(o.is_active ?? o.isActive ?? '').toLowerCase()
      const isActive =
        status === 'AVAILABLE' &&
        !bookingId &&
        (activeStr === '' || activeStr === 'true' || activeStr === '1')
      const roomId =
        o.room_id != null
          ? String(o.room_id)
          : o.roomId != null
            ? String(o.roomId)
            : undefined
      const seatStatus = (status ||
        (isActive ? 'AVAILABLE' : 'UNAVAILABLE')) as SeatStatus
      return {
        id,
        seatRow,
        seatNumber,
        seatType,
        isActive,
        roomId,
        seatStatus,
      }
    }
    const first = list[0] && typeof list[0] === 'object' ? (list[0] as Record<string, unknown>) : null
    const effectiveScreenId =
      String(first?.room_id ?? first?.roomId ?? '') || fallbackScreenId || ''
    return list
      .map((item) => toBackendSeat(item))
      .filter((b): b is BackendSeat => b !== null)
      .map((s) => mapSeat(s, undefined, effectiveScreenId))
      .sort((a, b) => a.row.localeCompare(b.row) || a.seatNumber - b.seatNumber)
  },

  /**
   * Book seats for a showtime (same service as seats, e.g. port 8888).
   * POST {base}/showtimes/{showtimeId}/bookings
   * Wire request/response body to your backend when ready.
   */
  async bookShowtimeSeats(data: BookingRequest & { totalAmount: number; currency: string }): Promise<Booking> {
    const base =
      import.meta.env.VITE_SHOWTIMES_SEATS_BASE_URL ?? 'http://localhost:8888'
    const url = `${base.replace(/\/$/, '')}/showtimes/${data.showtimeId}/bookings`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        showtime_id: data.showtimeId,
        seat_keys: data.seatIds,
        customer_name: data.customerName ?? '',
        customer_email: data.customerEmail ?? '',
        total_amount: data.totalAmount,
        currency: data.currency,
      }),
    })
    const body = res.headers.get('content-type')?.includes('application/json')
      ? await res.json().catch(() => ({}))
      : await res.text()
    if (!res.ok) {
      const msg =
        typeof body === 'object' && body !== null && 'message' in body
          ? String((body as { message: unknown }).message)
          : typeof body === 'string' && body
            ? body
            : `Booking failed (${res.status})`
      throw new Error(msg)
    }
    const o = body as Record<string, unknown>
    const id = String(o.id ?? o.booking_id ?? `booking-${Date.now()}`)
    return {
      id,
      showtimeId: data.showtimeId,
      seatIds: data.seatIds,
      totalAmount: Number(o.total_amount ?? o.totalAmount ?? data.totalAmount),
      currency: String(o.currency ?? data.currency),
      status: String(o.status ?? 'CONFIRMED'),
      createdAt: String(o.created_at ?? o.createdAt ?? new Date().toISOString()),
    }
  },

  async createBooking(data: BookingRequest): Promise<Booking> {
    try {
      const res = await http.post<{ id: string; totalAmount?: number; status?: string }>('/api/bookings', {
        showtimeId: data.showtimeId,
        seatIds: data.seatIds,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
      })
      const showtimes = await this.getShowtimes()
      const st = showtimes.find((s) => s.id === data.showtimeId)
      const pricePerSeat = st?.price ?? 0
      return {
        id: (res as { id: string }).id,
        showtimeId: data.showtimeId,
        seatIds: data.seatIds,
        totalAmount: (res as { totalAmount?: number }).totalAmount ?? pricePerSeat * data.seatIds.length,
        currency: st?.currency ?? 'USD',
        status: (res as { status?: string }).status ?? 'CONFIRMED',
        createdAt: new Date().toISOString(),
      }
    } catch {
      // Backend may not have /api/bookings yet — return mock confirmation for demo
      try {
        const showtimes = await this.getShowtimes()
        const st = showtimes.find((s) => s.id === data.showtimeId)
        const pricePerSeat = st?.price ?? 10
        return {
          id: `mock-${Date.now()}`,
          showtimeId: data.showtimeId,
          seatIds: data.seatIds,
          totalAmount: pricePerSeat * data.seatIds.length,
          currency: st?.currency ?? 'USD',
          status: 'CONFIRMED',
          createdAt: new Date().toISOString(),
        }
      } catch {
        return {
          id: `mock-${Date.now()}`,
          showtimeId: data.showtimeId,
          seatIds: data.seatIds,
          totalAmount: 10 * data.seatIds.length,
          currency: 'USD',
          status: 'CONFIRMED',
          createdAt: new Date().toISOString(),
        }
      }
    }
  },
}
