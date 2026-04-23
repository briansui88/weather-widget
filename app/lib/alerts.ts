export interface AlertData {
  headline: string
  severity: 'extreme' | 'severe' | 'moderate'
  type: 'weather' | 'earthquake'
}

async function fetchNWSAlert(lat: number, lon: number): Promise<AlertData | null> {
  try {
    const res = await fetch(
      `https://api.weather.gov/alerts/active?point=${lat},${lon}&limit=1`,
      {
        headers: { 'User-Agent': 'weather-widget/1.0' },
        signal: AbortSignal.timeout(5000),
      }
    )
    if (!res.ok) return null
    const data = await res.json()
    if (!data.features?.length) return null

    const p = data.features[0].properties
    const sevMap: Record<string, AlertData['severity']> = {
      Extreme: 'extreme', Severe: 'severe', Moderate: 'moderate', Minor: 'moderate',
    }
    return {
      headline: p.headline || p.event,
      severity: sevMap[p.severity] ?? 'moderate',
      type: 'weather',
    }
  } catch {
    return null
  }
}

async function fetchEarthquakeAlert(lat: number, lon: number): Promise<AlertData | null> {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const res = await fetch(
      `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&latitude=${lat}&longitude=${lon}&maxradiuskm=200&minmagnitude=4.5&orderby=time&limit=1&starttime=${since}`,
      { signal: AbortSignal.timeout(5000) }
    )
    if (!res.ok) return null
    const data = await res.json()
    if (!data.features?.length) return null

    const { mag, place } = data.features[0].properties
    return {
      headline: `M${mag.toFixed(1)} earthquake — ${place}`,
      severity: mag >= 5.5 ? 'extreme' : mag >= 5 ? 'severe' : 'moderate',
      type: 'earthquake',
    }
  } catch {
    return null
  }
}

export async function fetchAlerts(lat: number, lon: number, isUS: boolean): Promise<AlertData | null> {
  const [nws, eq] = await Promise.all([
    isUS ? fetchNWSAlert(lat, lon) : Promise.resolve(null),
    fetchEarthquakeAlert(lat, lon),
  ])

  if (!nws && !eq) return null
  if (!nws) return eq
  if (!eq) return nws

  const rank = { extreme: 3, severe: 2, moderate: 1 }
  return rank[nws.severity] >= rank[eq.severity] ? nws : eq
}
