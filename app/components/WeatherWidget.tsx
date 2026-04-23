'use client'

import { useState, useEffect, useCallback } from 'react'
import AnimatedBackground from './AnimatedBackground'
import { fetchWeather, type WeatherData } from '../lib/weather'
import { getOutfit } from '../lib/outfit'

const CITIES = [
  { name: 'New York',   country: 'USA',       lat: 40.7128,  lon: -74.0060,  tz: 'America/New_York' },
  { name: 'London',     country: 'UK',        lat: 51.5074,  lon: -0.1278,   tz: 'Europe/London' },
  { name: 'Tokyo',      country: 'Japan',     lat: 35.6762,  lon: 139.6503,  tz: 'Asia/Tokyo' },
  { name: 'Sydney',     country: 'Australia', lat: -33.8688, lon: 151.2093,  tz: 'Australia/Sydney' },
  { name: 'Dubai',      country: 'UAE',       lat: 25.2048,  lon: 55.2708,   tz: 'Asia/Dubai' },
  { name: 'São Paulo',  country: 'Brazil',    lat: -23.5505, lon: -46.6333,  tz: 'America/Sao_Paulo' },
  { name: 'Lagos',      country: 'Nigeria',   lat: 6.5244,   lon: 3.3792,    tz: 'Africa/Lagos' },
  { name: 'Paris',      country: 'France',    lat: 48.8566,  lon: 2.3522,    tz: 'Europe/Paris' },
]

function formatLocalTime(tz: string): { day: string; time: string } {
  const now = new Date()
  const day = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: tz }).format(now)
  const time = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true, timeZone: tz,
  }).format(now)
  return { day, time }
}

export default function WeatherWidget() {
  const [cityIdx, setCityIdx] = useState(0)
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [localTime, setLocalTime] = useState({ day: 'Today', time: '' })

  const city = CITIES[cityIdx]

  const loadWeather = useCallback(async (idx: number) => {
    setLoading(true)
    setError(false)
    try {
      const data = await fetchWeather(CITIES[idx].lat, CITIES[idx].lon)
      setWeather(data)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadWeather(cityIdx) }, [cityIdx, loadWeather])

  useEffect(() => {
    const tick = () => setLocalTime(formatLocalTime(city.tz))
    tick()
    const id = setInterval(tick, 10_000)
    return () => clearInterval(id)
  }, [city.tz])

  const prev = () => setCityIdx(i => (i - 1 + CITIES.length) % CITIES.length)
  const next = () => setCityIdx(i => (i + 1) % CITIES.length)

  const bg = weather
    ? { condition: weather.condition, isDay: weather.isDay }
    : { condition: 'clear' as const, isDay: new Date().getHours() > 6 && new Date().getHours() < 20 }

  const outfit = weather && !loading
    ? getOutfit(weather.temp, weather.condition, weather.windSpeed)
    : null

  return (
    <div className="relative w-[380px] h-[470px] rounded-3xl overflow-hidden shadow-2xl widget-grain select-none">
      {/* Animated background */}
      <AnimatedBackground condition={bg.condition} isDay={bg.isDay} />

      {/* Content overlay */}
      <div className="absolute inset-0 z-10 flex flex-col justify-between p-6">

        {/* Top row: day/time + temperature */}
        <div className="flex justify-between items-start">
          <div>
            <div className="text-white font-semibold text-base leading-tight drop-shadow">
              {localTime.day}
            </div>
            <div className="text-white/80 text-sm leading-tight mt-0.5 drop-shadow">
              {localTime.time}
            </div>
          </div>
          <div className="text-white font-bold leading-none drop-shadow"
            style={{ fontSize: '80px', letterSpacing: '-2px', marginTop: '-8px' }}>
            {loading ? '—' : error ? '?' : `${weather!.temp}°`}
          </div>
        </div>

        {/* Bottom section: outfit + city nav */}
        <div>
          {/* Outfit recommendation */}
          <div className="mb-3 min-h-[28px]">
            {outfit && (
              <span className="inline-block bg-black/30 backdrop-blur-sm text-white/90 text-xs font-medium px-3 py-1.5 rounded-full tracking-wide">
                {outfit}
              </span>
            )}
            {loading && (
              <span className="inline-block bg-black/20 backdrop-blur-sm text-white/50 text-xs px-3 py-1.5 rounded-full">
                Loading…
              </span>
            )}
            {error && (
              <span className="inline-block bg-black/20 backdrop-blur-sm text-white/50 text-xs px-3 py-1.5 rounded-full">
                Could not load weather
              </span>
            )}
          </div>

          {/* City navigation */}
          <div className="flex items-end gap-2">
            <button
              onClick={prev}
              className="text-white/50 hover:text-white transition-colors text-3xl font-light leading-none pb-1"
              aria-label="Previous city"
            >
              ‹
            </button>
            <div className="flex-1">
              <div className="text-white font-bold leading-tight drop-shadow"
                style={{ fontSize: '26px' }}>
                {city.name}
              </div>
              <div className="text-white font-bold leading-tight drop-shadow"
                style={{ fontSize: '20px' }}>
                {city.country}
              </div>
            </div>
            <button
              onClick={next}
              className="text-white/50 hover:text-white transition-colors text-3xl font-light leading-none pb-1"
              aria-label="Next city"
            >
              ›
            </button>
          </div>

          {/* City dots */}
          <div className="flex gap-1.5 mt-2.5 pl-7">
            {CITIES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCityIdx(i)}
                className={`rounded-full transition-all ${
                  i === cityIdx
                    ? 'bg-white w-4 h-1.5'
                    : 'bg-white/35 hover:bg-white/55 w-1.5 h-1.5'
                }`}
                aria-label={CITIES[i].name}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
