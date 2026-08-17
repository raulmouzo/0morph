import { connection } from "next/server"

import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  Moon,
  Sun,
  type LucideIcon,
} from "lucide-react"

export type Coordinates = {
  latitude: number
  longitude: number
}

export const A_CORUNA: Coordinates = { latitude: 43.3713, longitude: -8.396 }

export type Weather = {
  temperatureC: number
  description: string
  Icon: LucideIcon
}

const WEATHER_CODES: Record<number, { day: string; night: string }> = {
  0: { day: "Sunny", night: "Clear" },
  1: { day: "Mainly Sunny", night: "Mainly Clear" },
  2: { day: "Partly Cloudy", night: "Partly Cloudy" },
  3: { day: "Cloudy", night: "Cloudy" },
  45: { day: "Foggy", night: "Foggy" },
  48: { day: "Rime Fog", night: "Rime Fog" },
  51: { day: "Light Drizzle", night: "Light Drizzle" },
  53: { day: "Drizzle", night: "Drizzle" },
  55: { day: "Heavy Drizzle", night: "Heavy Drizzle" },
  56: { day: "Light Freezing Drizzle", night: "Light Freezing Drizzle" },
  57: { day: "Freezing Drizzle", night: "Freezing Drizzle" },
  61: { day: "Light Rain", night: "Light Rain" },
  63: { day: "Rain", night: "Rain" },
  65: { day: "Heavy Rain", night: "Heavy Rain" },
  66: { day: "Light Freezing Rain", night: "Light Freezing Rain" },
  67: { day: "Freezing Rain", night: "Freezing Rain" },
  71: { day: "Light Snow", night: "Light Snow" },
  73: { day: "Snow", night: "Snow" },
  75: { day: "Heavy Snow", night: "Heavy Snow" },
  77: { day: "Snow Grains", night: "Snow Grains" },
  80: { day: "Light Showers", night: "Light Showers" },
  81: { day: "Showers", night: "Showers" },
  82: { day: "Heavy Showers", night: "Heavy Showers" },
  85: { day: "Light Snow Showers", night: "Light Snow Showers" },
  86: { day: "Snow Showers", night: "Snow Showers" },
  95: { day: "Thunderstorm", night: "Thunderstorm" },
  96: { day: "Light Thunderstorms With Hail", night: "Light Thunderstorms With Hail" },
  99: { day: "Thunderstorm With Hail", night: "Thunderstorm With Hail" },
}

const WEATHER_ICONS: Record<number, { day: LucideIcon; night: LucideIcon }> = {
  0: { day: Sun, night: Moon },
  1: { day: Sun, night: Moon },
  2: { day: CloudSun, night: CloudMoon },
  3: { day: Cloud, night: Cloud },
  45: { day: CloudFog, night: CloudFog },
  48: { day: CloudFog, night: CloudFog },
  51: { day: CloudDrizzle, night: CloudDrizzle },
  53: { day: CloudDrizzle, night: CloudDrizzle },
  55: { day: CloudDrizzle, night: CloudDrizzle },
  56: { day: CloudDrizzle, night: CloudDrizzle },
  57: { day: CloudDrizzle, night: CloudDrizzle },
  61: { day: CloudRain, night: CloudRain },
  63: { day: CloudRain, night: CloudRain },
  65: { day: CloudRain, night: CloudRain },
  66: { day: CloudRain, night: CloudRain },
  67: { day: CloudRain, night: CloudRain },
  71: { day: CloudSnow, night: CloudSnow },
  73: { day: CloudSnow, night: CloudSnow },
  75: { day: CloudSnow, night: CloudSnow },
  77: { day: CloudSnow, night: CloudSnow },
  80: { day: CloudDrizzle, night: CloudDrizzle },
  81: { day: CloudDrizzle, night: CloudDrizzle },
  82: { day: CloudDrizzle, night: CloudDrizzle },
  85: { day: CloudSnow, night: CloudSnow },
  86: { day: CloudSnow, night: CloudSnow },
  95: { day: CloudLightning, night: CloudLightning },
  96: { day: CloudLightning, night: CloudLightning },
  99: { day: CloudLightning, night: CloudLightning },
}

export async function getWeather(coords: Coordinates): Promise<Weather | null> {
  await connection()

  try {
    const params = new URLSearchParams({
      latitude: String(coords.latitude),
      longitude: String(coords.longitude),
      hourly: "temperature_2m,weather_code,is_day",
      timezone: "auto",
    })
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
      next: { revalidate: 600 },
    })
    if (!res.ok) return null

    const data = await res.json()
    const times: string[] = data.hourly.time
    const now = Date.now()

    let index = 0
    let closestDiff = Infinity
    for (let i = 0; i < times.length; i++) {
      const diff = Math.abs(new Date(times[i]).getTime() - now)
      if (diff < closestDiff) {
        closestDiff = diff
        index = i
      }
    }

    const temperatureC = Math.round(data.hourly.temperature_2m[index])
    const code: number = data.hourly.weather_code[index]
    const isDay = data.hourly.is_day[index] === 1

    const entry = WEATHER_CODES[code] ?? WEATHER_CODES[3]
    const icons = WEATHER_ICONS[code] ?? WEATHER_ICONS[3]

    return {
      temperatureC,
      description: isDay ? entry.day : entry.night,
      Icon: isDay ? icons.day : icons.night,
    }
  } catch {
    return null
  }
}
