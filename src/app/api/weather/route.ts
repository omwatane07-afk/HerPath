import { NextRequest, NextResponse } from 'next/server';
import { WeatherContext } from '@/types';

/**
 * Server-Side Route Handler for OpenWeatherMap
 * Keeps server credentials secure while delivering live journey weather to clients.
 * Official Documentation: https://openweathermap.org/api
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const latStr = searchParams.get('lat');
  const lonStr = searchParams.get('lon');

  if (!latStr || !lonStr) {
    return NextResponse.json(
      { error: 'Latitude and Longitude parameters are required' },
      { status: 400 }
    );
  }

  const lat = parseFloat(latStr);
  const lon = parseFloat(lonStr);

  if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return NextResponse.json(
      { error: 'Coordinates are out of valid range' },
      { status: 400 }
    );
  }

  const apiKey =
    process.env.OPENWEATHER_API_KEY ||
    process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY ||
    '';

  if (!apiKey || apiKey.trim().length === 0) {
    const fallback: WeatherContext = {
      tempCelsius: 24,
      feelsLikeCelsius: 24,
      condition: 'Unavailable',
      description: 'OpenWeatherMap API key not configured',
      icon: '01d',
      humidityPercent: 50,
      windSpeedMps: 2.0,
      observedAt: new Date().toISOString(),
      source: 'unavailable',
      isLive: false,
      statusMessage: 'Set OPENWEATHER_API_KEY in .env.local to activate live journey weather observations.',
    };
    return NextResponse.json(fallback);
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 300 }, // Cache on server for 5 minutes
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json({
          tempCelsius: 0,
          feelsLikeCelsius: 0,
          condition: 'Auth Error',
          description: 'Invalid OpenWeatherMap API Key',
          icon: '01d',
          humidityPercent: 0,
          windSpeedMps: 0,
          observedAt: new Date().toISOString(),
          source: 'unavailable',
          isLive: false,
          statusMessage: 'OpenWeatherMap API returned 401 Unauthorized. Verify your API key in .env.local.',
        });
      }

      return NextResponse.json({
        tempCelsius: 0,
        feelsLikeCelsius: 0,
        condition: 'API Error',
        description: `Weather request failed (${response.status})`,
        icon: '01d',
        humidityPercent: 0,
        windSpeedMps: 0,
        observedAt: new Date().toISOString(),
        source: 'unavailable',
        isLive: false,
        statusMessage: `OpenWeatherMap returned HTTP status ${response.status}`,
      });
    }

    const data = await response.json();
    const weatherItem = data.weather?.[0] || {};
    const main = data.main || {};
    const wind = data.wind || {};

    const condition = weatherItem.main || 'Clear';
    const description = weatherItem.description || 'clear sky';
    const icon = weatherItem.icon || '01d';
    const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

    const temp = Math.round(main.temp ?? 20);
    const feelsLike = Math.round(main.feels_like ?? temp);
    const humidity = Math.round(main.humidity ?? 50);
    const windSpeed = Math.round((wind.speed ?? 0) * 10) / 10;
    const visibility = data.visibility ? Math.round(data.visibility) : undefined;
    const rainMm = data.rain?.['1h'] ? Math.round(data.rain['1h'] * 10) / 10 : undefined;

    // Generate practical pedestrian safety advisory based on genuine telemetry
    let advisoryNote: string | undefined;
    const condLower = condition.toLowerCase();

    if (condLower.includes('rain') || condLower.includes('drizzle')) {
      advisoryNote = `Precipitation (${description}) observed; pedestrian walkways may be slick. Consider choosing well-paved, lit corridors.`;
    } else if (condLower.includes('thunderstorm')) {
      advisoryNote = 'Thunderstorm active along route area; seek immediate shelter in verified public buildings or metro stations.';
    } else if (condLower.includes('snow')) {
      advisoryNote = 'Snow/ice conditions; exercise caution on unpaved footpaths.';
    } else if (visibility && visibility < 1000) {
      advisoryNote = `Low visibility (${visibility}m due to ${description}); prioritize primary illuminated boulevards with verified streetlights.`;
    } else if (temp >= 35) {
      advisoryNote = `High ambient temperature (${temp}°C); plan stops near air-conditioned transit stops or open public facilities.`;
    } else {
      advisoryNote = `Favorable walking conditions (${temp}°C, ${description}); comfortable pedestrian transit pace.`;
    }

    const weatherContext: WeatherContext = {
      tempCelsius: temp,
      feelsLikeCelsius: feelsLike,
      condition,
      description,
      icon,
      iconUrl,
      humidityPercent: humidity,
      windSpeedMps: windSpeed,
      visibilityMeters: visibility,
      rainMm,
      observedAt: new Date(data.dt ? data.dt * 1000 : Date.now()).toISOString(),
      source: 'live_openweathermap',
      isLive: true,
      advisoryNote,
      statusMessage: `Live observations from OpenWeatherMap weather station (${data.name || 'Local Grid'})`,
    };

    return NextResponse.json(weatherContext, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (err: any) {
    console.warn('OpenWeatherMap server route error:', err.message);
    const fallback: WeatherContext = {
      tempCelsius: 0,
      feelsLikeCelsius: 0,
      condition: 'Network Timeout',
      description: 'Unable to reach weather provider',
      icon: '01d',
      humidityPercent: 0,
      windSpeedMps: 0,
      observedAt: new Date().toISOString(),
      source: 'unavailable',
      isLive: false,
      statusMessage: 'Network error or timeout while connecting to OpenWeatherMap API.',
    };
    return NextResponse.json(fallback);
  }
}
