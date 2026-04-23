export type WeatherCondition =
  | 'clear'
  | 'partly_cloudy'
  | 'cloudy'
  | 'foggy'
  | 'drizzle'
  | 'rain'
  | 'snow'
  | 'thunderstorm'

export interface WeatherData {
  temp: number
  condition: WeatherCondition
  isDay: boolean
  windSpeed: number
}

export function getCondition(code: number): WeatherCondition {
  if (code === 0) return 'clear'
  if (code <= 3) return 'partly_cloudy'
  if (code <= 48) return 'foggy'
  if (code <= 55) return 'drizzle'
  if (code <= 67) return 'rain'
  if (code <= 77) return 'snow'
  if (code <= 82) return 'rain'
  if (code <= 86) return 'snow'
  return 'thunderstorm'
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m,is_day&timezone=auto`,
    { cache: 'no-store' }
  )
  if (!res.ok) throw new Error('Failed to fetch weather')
  const data = await res.json()
  return {
    temp: Math.round(data.current.temperature_2m),
    condition: getCondition(data.current.weather_code),
    isDay: data.current.is_day === 1,
    windSpeed: Math.round(data.current.wind_speed_10m),
  }
}
