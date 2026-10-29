'use client';

import React from 'react';
import { WeatherContext } from '@/types';
import { formatRelativeTime } from '@/lib/utils';
import {
  Cloud,
  Sun,
  CloudRain,
  CloudLightning,
  Wind,
  Droplets,
  Eye,
  Clock,
  Sparkles,
  Info,
  Radio,
} from 'lucide-react';

interface WeatherWidgetProps {
  weather: WeatherContext | null;
  isLoading?: boolean;
  compact?: boolean;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  weather,
  isLoading = false,
  compact = false,
}) => {
  if (isLoading) {
    return (
      <div className="p-3 rounded-2xl bg-white/80 border border-purple-100 shadow-sm animate-pulse flex items-center justify-between text-xs text-soft-ink">
        <div className="flex items-center gap-2">
          <Cloud className="w-4 h-4 text-grape" />
          <span>Retrieving journey weather telemetry...</span>
        </div>
      </div>
    );
  }

  if (!weather) return null;

  // Choose appropriate fallback icon if image isn't loaded
  const getWeatherIcon = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes('rain') || c.includes('drizzle')) return <CloudRain className="w-5 h-5 text-sky-600" />;
    if (c.includes('thunder')) return <CloudLightning className="w-5 h-5 text-amber-500" />;
    if (c.includes('cloud')) return <Cloud className="w-5 h-5 text-periwinkle" />;
    return <Sun className="w-5 h-5 text-amber-500" />;
  };

  if (compact) {
    return (
      <div className="p-2.5 rounded-2xl bg-white/90 border border-purple-100 shadow-sm flex items-center justify-between gap-3 text-xs backdrop-blur-md">
        <div className="flex items-center gap-2 min-w-0">
          {weather.iconUrl ? (
            <img src={weather.iconUrl} alt={weather.condition} className="w-7 h-7 object-contain" />
          ) : (
            getWeatherIcon(weather.condition)
          )}
          <div className="min-w-0">
            <div className="font-heading font-extrabold text-ink text-xs flex items-center gap-1.5">
              <span>{weather.isLive ? `${weather.tempCelsius}°C` : 'Weather Feed'}</span>
              <span className="text-soft-ink font-semibold capitalize truncate">• {weather.condition}</span>
            </div>
            {weather.isLive ? (
              <p className="text-[10px] text-soft-ink truncate">{weather.description}</p>
            ) : (
              <p className="text-[10px] text-soft-ink truncate">{weather.statusMessage}</p>
            )}
          </div>
        </div>

        <span
          className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 border ${
            weather.isLive
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-[#F1EAFF] text-soft-ink border-lilac'
          }`}
        >
          {weather.isLive ? '✓ Live OpenWeather' : 'Key Required'}
        </span>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-[22px] bg-white border border-purple-100 shadow-sm space-y-3 relative overflow-hidden backdrop-blur-md">
      {/* Header Row: Title & Live Badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-grape font-heading uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-grape" />
          <span>Journey Weather Context</span>
        </div>

        <span
          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
            weather.isLive
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
              : 'bg-amber-50 text-amber-900 border-amber-200'
          }`}
        >
          <Radio className="w-3 h-3" />
          <span>{weather.isLive ? 'OpenWeatherMap Live' : 'Weather Feed Offline'}</span>
        </span>
      </div>

      {weather.isLive ? (
        <>
          {/* Main Weather Metrics */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {weather.iconUrl ? (
                <img
                  src={weather.iconUrl}
                  alt={weather.condition}
                  className="w-12 h-12 -my-2 object-contain"
                />
              ) : (
                getWeatherIcon(weather.condition)
              )}
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-heading text-2xl font-extrabold text-ink tabular-nums">
                    {weather.tempCelsius}°C
                  </span>
                  <span className="text-xs text-soft-ink font-medium">
                    (feels like {weather.feelsLikeCelsius}°C)
                  </span>
                </div>
                <div className="text-xs font-bold text-ink capitalize">{weather.description}</div>
              </div>
            </div>

            {/* Micro telemetry stack */}
            <div className="text-right text-[11px] text-soft-ink space-y-0.5 font-medium tabular-nums">
              <div className="flex items-center justify-end gap-1">
                <Wind className="w-3 h-3 text-grape" />
                <span>{weather.windSpeedMps} m/s wind</span>
              </div>
              <div className="flex items-center justify-end gap-1">
                <Droplets className="w-3 h-3 text-sky-600" />
                <span>{weather.humidityPercent}% humidity</span>
              </div>
              {weather.visibilityMeters && (
                <div className="flex items-center justify-end gap-1">
                  <Eye className="w-3 h-3 text-soft-ink" />
                  <span>{(weather.visibilityMeters / 1000).toFixed(1)} km vis</span>
                </div>
              )}
            </div>
          </div>

          {/* Pedestrian Advisory Banner */}
          {weather.advisoryNote && (
            <div className="p-2.5 rounded-xl bg-[#FCFAFF] border border-purple-100 text-xs text-soft-ink font-medium leading-relaxed flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-grape shrink-0 mt-0.5" />
              <span>{weather.advisoryNote}</span>
            </div>
          )}

          {/* Observation Timestamp */}
          <div className="text-[10px] text-soft-ink flex items-center justify-between pt-1 border-t border-purple-100/60">
            <span className="flex items-center gap-1 font-medium">
              <Clock className="w-3 h-3" />
              <span>Observed {formatRelativeTime(weather.observedAt)}</span>
            </span>
            <span className="italic">Live atmospheric station</span>
          </div>
        </>
      ) : (
        <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900 space-y-1.5">
          <p className="font-semibold leading-relaxed">
            Live weather integration requires an OpenWeatherMap API key.
          </p>
          <p className="text-[11px] text-amber-800">
            {weather.statusMessage || 'Configure OPENWEATHER_API_KEY in .env.local to show live temperature and precipitation.'}
          </p>
        </div>
      )}
    </div>
  );
};
