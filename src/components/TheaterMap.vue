<template>
  <div class="theater-map">
    <div v-if="!address" class="rounded-lg border border-cinema-border bg-cinema-surface p-4 text-center text-sm text-cinema-muted">
      No address provided for this theater.
    </div>
    <template v-else>
      <div ref="mapEl" class="h-64 w-full rounded-lg border border-cinema-border bg-cinema-surface" />
      <p v-if="loading" class="mt-2 text-xs text-emerald-400">Loading map…</p>
      <p v-if="geocodeError" class="mt-2 text-xs text-red-600">{{ geocodeError }}</p>
      <div class="mt-3 flex flex-wrap items-center gap-3">
        <a
          :href="googleMapsSearchUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400 hover:underline"
        >
          <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          Open in Google Maps
        </a>
        <a
          :href="googleMapsDirectionsUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400 hover:underline"
        >
          <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.446-2.724A1 1 0 013 16.382V5.618a1 1 0 011.554-.832L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          Get directions (Google Maps)
        </a>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = withDefaults(
  defineProps<{
    name: string
    address?: string
    /** Initial center if geocoding not yet done (e.g. Hanoi) */
    defaultLat?: number
    defaultLng?: number
    defaultZoom?: number
  }>(),
  { defaultLat: 21.0285, defaultLng: 105.8542, defaultZoom: 12 }
)

const mapEl = ref<HTMLElement | null>(null)
const loading = ref(false)
const geocodeError = ref('')

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org'
const NOMINATIM_HEADERS: HeadersInit = {
  Accept: 'application/json',
  'User-Agent': 'Reel-Tickets/1.0',
}
const OSM_TILE = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

const googleMapsSearchUrl = computed(() => {
  if (!props.address) return '#'
  const q = encodeURIComponent(`${props.name} ${props.address}`)
  return `https://www.google.com/maps/search/?api=1&query=${q}`
})

const googleMapsDirectionsUrl = computed(() => {
  if (!props.address) return '#'
  const dest = encodeURIComponent(`${props.name} ${props.address}`)
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}`
})

let map: L.Map | null = null
let marker: L.Marker | null = null

function createMarkerIcon() {
  return L.divIcon({
    className: 'theater-map-marker',
    html: '<div style="background:#b8860b;width:28px;height:28px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.4);"></div>',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}

/** Nominatim allows 1 request per second; delay between retries. */
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function geocodeOne(query: string): Promise<{ lat: number; lng: number } | null> {
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: '1',
  })
  const res = await fetch(`${NOMINATIM_BASE}/search?${params}`, { headers: NOMINATIM_HEADERS })
  if (!res.ok) return null
  const data = await res.json()
  if (!Array.isArray(data) || data.length === 0) return null
  const lat = parseFloat(data[0].lat)
  const lon = parseFloat(data[0].lon)
  if (Number.isNaN(lat) || Number.isNaN(lon)) return null
  return { lat, lng: lon }
}

/** Try several query variants; Nominatim often fails on "Name + full address" but finds "address only". */
async function geocode(name: string, address: string): Promise<{ lat: number; lng: number } | null> {
  const raw: string[] = [
    `${name} ${address}`.trim(),
    address.trim(),
  ]
  const parts = address.split(',').map((p) => p.trim()).filter(Boolean)
  if (parts.length > 2) raw.push(parts.slice(0, 2).join(', '))
  if (parts.length > 1) raw.push(parts[0])
  const queries = [...new Set(raw.map((s) => s.trim()).filter(Boolean))]
  for (let i = 0; i < queries.length; i++) {
    if (i > 0) await delay(1100)
    const coords = await geocodeOne(queries[i])
    if (coords) return coords
  }
  return null
}

function setMarker(lat: number, lng: number) {
  if (!map) return
  const latlng = L.latLng(lat, lng)
  if (marker) marker.setLatLng(latlng)
  else marker = L.marker(latlng, { icon: createMarkerIcon() }).addTo(map)
  map.setView(latlng, 15)
}

function initMap() {
  if (!mapEl.value) return
  const center: [number, number] = [props.defaultLat, props.defaultLng]
  map = L.map(mapEl.value).setView(center, props.defaultZoom)
  L.tileLayer(OSM_TILE, { attribution: OSM_ATTRIBUTION }).addTo(map)
}

async function loadAndShow() {
  if (!props.address || !map) return
  loading.value = true
  geocodeError.value = ''
  try {
    const coords = await geocode(props.name, props.address)
    if (coords) {
      setMarker(coords.lat, coords.lng)
    } else {
      geocodeError.value = 'Could not find location. Use the links below to open in Google Maps.'
      map.setView([props.defaultLat, props.defaultLng], props.defaultZoom)
    }
  } catch {
    geocodeError.value = 'Failed to load map location.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  initMap()
  if (props.address) loadAndShow()
})

watch(
  () => [props.address, props.name],
  () => {
    if (props.address) loadAndShow()
  }
)

onBeforeUnmount(() => {
  if (map) {
    map.remove()
    map = null
  }
  marker = null
})
</script>

<style scoped>
.theater-map-marker {
  background: none !important;
  border: none !important;
}
</style>
