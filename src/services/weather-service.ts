import { Coordinates, WeatherContext } from '../types';

let cachedWeather: {
  key: string;
  data: WeatherContext;
  timestamp: number;
} | null = null;

const CACHE_DURATION_MS = 3 * 60 * 1000; // 3 minutes client-side cache

/**
 * Retrieves current weather observations for a given location using OpenWeatherMap.
 * Handles missing keys, rate limits, and network errors gracefully without fabricating sample data.
 */
export async function fetchCurrentWeather(coords: Coordinates): Promise<WeatherContext> {
  const cacheKey = `${coords.lat.toFixed(2)}_${coords.lng.toFixed(2)}`;
  const now = Date.now();

  if (cachedWeather && cachedWeather.key === cacheKey && now - cachedWeather.timestamp < CACHE_DURATION_MS) {
    return cachedWeather.data;
  }

  try {
    const url = `/api/weather?lat=${coords.lat}&lon=${coords.lng}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data: WeatherContext = await response.json();
      cachedWeather = {
        key: cacheKey,
        data,
        timestamp: now,
      };
      return data;
    }
  } catch (err: any) {
    console.warn('Weather service fetch error:', err.message);
  }

  const fallback: WeatherContext = {
    tempCelsius: 0,
    feelsLikeCelsius: 0,
    condition: 'Unavailable',
    description: 'Weather service connection unavailable',
    icon: '01d',
    humidityPercent: 0,
    windSpeedMps: 0,
    observedAt: new Date().toISOString(),
    source: 'unavailable',
    isLive: false,
    statusMessage: 'Unable to retrieve live OpenWeatherMap feed at this time.',
  };

  return fallback;
}
