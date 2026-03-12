export interface Movie {
  id: string
  title: string
  description: string
  durationMinutes: number
  rating: string
  genre: string
  posterUrl: string
  isActive: boolean
  createdAt: string
}

export interface Theater {
  id: string
  name: string
  address: string
  screenCount: number
  screens: Screen[]
  isActive: boolean
}

export interface Screen {
  id: string
  name: string
  capacity: number
  theaterId: string
}

export type SeatType = 'STANDARD' | 'PREMIUM' | 'WHEELCHAIR'

export interface Seat {
  id: string
  screenId: string
  row: string
  seatNumber: number
  type: SeatType
  isActive: boolean
  screen?: Screen
}

export interface Showtime {
  id: string
  movieId: string
  screenId: string
  theaterId: string
  startTime: string
  endTime: string
  price: number
  currency: string
  isActive: boolean
  movie?: Movie
  screen?: Screen
  theater?: Theater
}

export interface BookingRequest {
  showtimeId: string
  seatIds: string[]
  customerName?: string
  customerEmail?: string
}

export interface Booking {
  id: string
  showtimeId: string
  seatIds: string[]
  totalAmount: number
  currency: string
  status: string
  createdAt?: string
}

export interface User {
  id: string
  email: string
  name: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface CartItem {
  id: string
  showtimeId: string
  movieId: string
  movieTitle: string
  theaterName: string
  theaterAddress?: string
  screenName: string
  startTime: string
  seatIds: string[]
  pricePerSeat: number
  total: number
  currency: string
}

export interface PastBooking {
  id: string
  movieTitle: string
  theaterName: string
  screenName: string
  startTime: string
  seatCount: number
  totalAmount: number
  currency: string
  status: string
}
