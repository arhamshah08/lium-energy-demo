'use client'

import 'leaflet/dist/leaflet.css'
import type { Map, Marker } from 'leaflet'
import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

type NominatimResult = {
  place_id: number
  display_name: string
  lat: string
  lon: string
  address: {
    city?: string
    town?: string
    village?: string
    suburb?: string
    state?: string
    country?: string
    country_code?: string
  }
}

interface Props {
  value: string
  onChange: (location: string) => void
  error?: string
}

function toShortLabel(r: NominatimResult): string {
  const a = r.address
  const city = a.city || a.town || a.village || a.suburb || ''
  const state = a.state || ''
  const country = a.country_code?.toLowerCase() === 'us' ? '' : (a.country || '')
  const parts = [city, state, country].filter(Boolean)
  return parts.length ? parts.join(', ') : r.display_name.split(',').slice(0, 2).join(',').trim()
}

function makePinHtml(color = '#006a65') {
  return `<div style="
    width:22px;height:22px;
    background:${color};
    border-radius:50% 50% 50% 0;
    transform:rotate(-45deg);
    border:2.5px solid #fff;
    box-shadow:0 2px 10px rgba(0,106,101,0.45);
  "></div>`
}

export function MapPicker({ value, onChange, error }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<Map | null>(null)
  const markerRef = useRef<Marker | null>(null)
  // keeps the latest onChange stable inside effects/event-handlers
  const onChangeRef = useRef(onChange)
  useEffect(() => { onChangeRef.current = onChange }, [onChange])

  const [query, setQuery] = useState(value)
  const [results, setResults] = useState<NominatimResult[]>([])
  const [searching, setSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedLabel, setSelectedLabel] = useState(value)
  const [mapReady, setMapReady] = useState(false)

  // ── prevent re-triggering search after a programmatic select ──
  const justSelectedRef = useRef(false)

  // ── click-outside to close dropdown ──
  const searchWrapRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!searchWrapRef.current?.contains(e.target as Node)) setShowDropdown(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ── init Leaflet (client-only, lazy) ──
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return
    let mounted = true

    ;(async () => {
      const L = (await import('leaflet')).default
      if (!mounted || !containerRef.current) return

      const map = L.map(containerRef.current, {
        center: [39.5, -98.35],
        zoom: 4,
        zoomControl: false,
      })
      mapRef.current = map

      // Carto Light — clean minimal tiles that match LIUM's aesthetic
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 20,
        attribution:
          '© <a href="https://carto.com" target="_blank">CARTO</a> | © <a href="https://openstreetmap.org/copyright" target="_blank">OSM</a>',
      }).addTo(map)

      L.control.zoom({ position: 'bottomright' }).addTo(map)

      const pinIcon = L.divIcon({
        html: makePinHtml(),
        iconSize: [22, 22],
        iconAnchor: [11, 22],
        className: '',
      })

      function placeMarker(lat: number, lng: number) {
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng])
        } else {
          markerRef.current = L.marker([lat, lng], { icon: pinIcon }).addTo(map)
        }
      }

      map.on('click', async (e) => {
        const { lat, lng } = e.latlng
        placeMarker(lat, lng)
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
            { headers: { 'Accept-Language': 'en-US,en' } },
          )
          const data: NominatimResult = await res.json()
          const label = toShortLabel(data)
          setSelectedLabel(label)
          setQuery(label)
          justSelectedRef.current = true
          onChangeRef.current(label)
        } catch {
          const label = `${lat.toFixed(5)}° N, ${Math.abs(lng).toFixed(5)}° ${lng >= 0 ? 'E' : 'W'}`
          setSelectedLabel(label)
          setQuery(label)
          justSelectedRef.current = true
          onChangeRef.current(label)
        }
      })

      if (mounted) {
        setMapReady(true)
        requestAnimationFrame(() => map.invalidateSize())
      }
    })()

    return () => {
      mounted = false
      mapRef.current?.remove()
      mapRef.current = null
      markerRef.current = null
    }
  }, [])

  // ── debounced forward-geocode search ──
  useEffect(() => {
    if (!query.trim()) { setResults([]); setShowDropdown(false); return }
    if (justSelectedRef.current) { justSelectedRef.current = false; return }

    const id = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`,
          { headers: { 'Accept-Language': 'en-US,en' } },
        )
        const data: NominatimResult[] = await res.json()
        setResults(data)
        setShowDropdown(data.length > 0)
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 420)

    return () => clearTimeout(id)
  }, [query])

  const selectResult = useCallback(async (r: NominatimResult) => {
    const label = toShortLabel(r)
    justSelectedRef.current = true
    setQuery(label)
    setSelectedLabel(label)
    setShowDropdown(false)
    onChangeRef.current(label)

    const lat = parseFloat(r.lat)
    const lng = parseFloat(r.lon)

    if (mapRef.current) {
      const L = (await import('leaflet')).default
      const pinIcon = L.divIcon({ html: makePinHtml(), iconSize: [22, 22], iconAnchor: [11, 22], className: '' })
      mapRef.current.setView([lat, lng], 12, { animate: true })
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng])
      } else {
        markerRef.current = L.marker([lat, lng], { icon: pinIcon }).addTo(mapRef.current)
      }
    }
  }, [])

  function clear() {
    setQuery('')
    setSelectedLabel('')
    setResults([])
    setShowDropdown(false)
    onChangeRef.current('')
    markerRef.current?.remove()
    markerRef.current = null
    mapRef.current?.setView([39.5, -98.35], 4, { animate: true })
  }

  return (
    <div className="space-y-3">
      <label className="block text-label-caps font-bold text-on-surface tracking-widest">
        LOCATION (GPS OR ADDRESS)
      </label>

      {/* ── Search bar (separate from map so dropdown isn't clipped) ── */}
      <div ref={searchWrapRef} className="relative">
        <div
          className={cn(
            'flex items-center bg-white border rounded-lg transition-all',
            error ? 'border-error' : 'border-outline-variant',
            'focus-within:ring-2 focus-within:ring-secondary/20 focus-within:border-secondary',
          )}
        >
          <span className="material-symbols-outlined text-outline text-[20px] pl-3 shrink-0">
            search
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowDropdown(false) }}
            onFocus={() => results.length > 0 && setShowDropdown(true)}
            placeholder="Search city, address, or GPS coordinates…"
            className="flex-1 px-3 py-3 text-body-base text-on-surface bg-transparent outline-none placeholder:text-outline"
          />
          {searching && (
            <span className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin mr-3 shrink-0" />
          )}
          {!searching && query && (
            <button type="button" onClick={clear} className="mr-3 text-outline hover:text-on-surface transition-colors shrink-0">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        {/* Dropdown */}
        {showDropdown && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 z-[1000] bg-white border border-outline-variant rounded-xl shadow-card-hover overflow-hidden">
            {results.map((r, i) => (
              <button
                key={r.place_id}
                type="button"
                onClick={() => selectResult(r)}
                className={cn(
                  'w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-surface-container-low transition-colors',
                  i > 0 && 'border-t border-outline-variant/30',
                )}
              >
                <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5 shrink-0">
                  location_on
                </span>
                <div className="min-w-0">
                  <p className="text-body-base text-on-surface font-medium truncate">{toShortLabel(r)}</p>
                  <p className="text-caption text-on-surface-variant truncate">{r.display_name}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Map card ── */}
      <div
        className={cn(
          'rounded-xl border overflow-hidden shadow-card transition-all',
          error ? 'border-error' : 'border-outline-variant',
        )}
      >
        {/* Leaflet container — MUST have real dimensions at all times.
            Hiding it with display:none gives Leaflet a 0×0 viewport at init,
            so tiles never load. Use an absolute overlay for the loading state. */}
        <div className="relative h-[300px]">
          {!mapReady && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-surface-container-low">
              <span className="w-6 h-6 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
              <p className="text-caption text-on-surface-variant">Loading map…</p>
            </div>
          )}
          <div ref={containerRef} className="w-full h-full" />
        </div>

        {/* Selected location footer */}
        {selectedLabel && (
          <div className="flex items-center gap-2 px-4 py-3 bg-secondary-container/20 border-t border-outline-variant/30">
            <span
              className="material-symbols-outlined text-secondary text-[16px] shrink-0"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              location_on
            </span>
            <span className="text-caption text-on-secondary-container font-medium">{selectedLabel}</span>
            <span className="ml-auto text-caption text-on-surface-variant">Click map to reposition</span>
          </div>
        )}
        {!selectedLabel && mapReady && (
          <div className="flex items-center gap-2 px-4 py-3 border-t border-outline-variant/30 bg-surface-container-low">
            <span className="material-symbols-outlined text-outline text-[16px]">touch_app</span>
            <span className="text-caption text-on-surface-variant">Click the map or search above to set your location</span>
          </div>
        )}
      </div>

      {error && <p className="text-caption text-error">{error}</p>}
    </div>
  )
}
