import type { WeatherCondition } from './weather'

export function getOutfit(temp: number, condition: WeatherCondition, windSpeed: number): string {
  const windy = windSpeed > 25

  if (condition === 'thunderstorm') return 'Stay inside if you can — storms out there'

  if (condition === 'snow') {
    if (temp < 0) return 'Full winter gear — coat, boots, gloves & hat'
    return 'Heavy coat, waterproof boots & warm layers'
  }

  if (condition === 'rain') {
    if (temp < 8) return 'Warm waterproof coat & boots — umbrella essential'
    if (temp < 16) return 'Rain jacket, warm layer & umbrella'
    return 'Waterproof layer & umbrella — warm but wet'
  }

  if (condition === 'drizzle') {
    return temp < 12
      ? 'Warm jacket with hood — light drizzle out'
      : 'Light jacket or umbrella just in case'
  }

  if (temp < 0) return `Heavy coat, scarf, gloves & hat${windy ? ' — brutal wind chill' : ''}`
  if (temp < 8) return `Warm coat & layers${windy ? ' — feels colder with wind' : ''}`
  if (temp < 14) return `Jacket & sweater${windy ? ' — breezy today' : ''}`
  if (temp < 20) return `Light jacket${windy ? ' — bit of a breeze' : ' or cardigan'}`
  if (temp < 26) return `T-shirt weather${windy ? ' — grab a light layer' : ' — enjoy it'}`
  if (temp < 32) return 'Light breathable clothes — stay hydrated'
  return 'Very hot — minimal clothing, sunscreen & water'
}
