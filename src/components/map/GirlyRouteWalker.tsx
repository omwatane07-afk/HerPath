'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { RouteOption } from '@/types';
import { getGirlyCharacterMarkerHtml } from '../character/GirlyCharacter';
import { Play, Pause, RotateCcw, Sparkles } from 'lucide-react';

interface GirlyRouteWalkerProps {
  route: RouteOption | null;
  autoPlay?: boolean;
}

// Haversine/Equirectangular distance approximation in meters
function computeSegmentDistance(p1: [number, number], p2: [number, number]): number {
  const lat1 = p1[0];
  const lng1 = p1[1];
  const lat2 = p2[0];
  const lng2 = p2[1];
  const avgLatRad = ((lat1 + lat2) / 2) * (Math.PI / 180);
  const dx = (lng2 - lng1) * Math.cos(avgLatRad);
  const dy = lat2 - lat1;
  return Math.sqrt(dx * dx + dy * dy) * 111320;
}

export const GirlyRouteWalker: React.FC<GirlyRouteWalkerProps> = ({
  route,
  autoPlay = true,
}) => {
  const map = useMap();
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [progress, setProgress] = useState(0); // 0 to 1
  const [facing, setFacing] = useState<'left' | 'right'>('right');
  const [hasArrived, setHasArrived] = useState(false);

  const coords = route?.coordinates || [];

  // Compute cumulative distances along the route geometry
  const { cumulativeDistances, totalDistance } = useMemo(() => {
    if (coords.length < 2) {
      return { cumulativeDistances: [0], totalDistance: 0 };
    }
    const cumulative: number[] = [0];
    let total = 0;
    for (let i = 0; i < coords.length - 1; i++) {
      const dist = computeSegmentDistance(coords[i], coords[i + 1]);
      total += Math.max(0.1, dist);
      cumulative.push(total);
    }
    return { cumulativeDistances: cumulative, totalDistance: total };
  }, [coords]);

  // Reset progress when route changes
  useEffect(() => {
    setProgress(0);
    setHasArrived(false);
    setIsPlaying(autoPlay);
  }, [route?.id, autoPlay]);

  // Animation Loop with requestAnimationFrame
  const reqRef = useRef<number | null>(null);
  const prevTimeRef = useRef<number | null>(null);
  const WALK_DURATION_MS = 10000; // 10 seconds to walk route preview

  useEffect(() => {
    if (!isPlaying || coords.length < 2 || totalDistance <= 0) {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
      prevTimeRef.current = null;
      return;
    }

    const animate = (timestamp: number) => {
      if (prevTimeRef.current === null) {
        prevTimeRef.current = timestamp;
      }
      const delta = timestamp - prevTimeRef.current;
      prevTimeRef.current = timestamp;

      setProgress((prev) => {
        const next = prev + delta / WALK_DURATION_MS;
        if (next >= 1) {
          setIsPlaying(false);
          setHasArrived(true);
          return 1;
        }
        return next;
      });

      reqRef.current = requestAnimationFrame(animate);
    };

    reqRef.current = requestAnimationFrame(animate);

    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, [isPlaying, coords.length, totalDistance]);

  // Calculate current interpolated [lat, lng] along route geometry
  const currentPos: [number, number] | null = useMemo(() => {
    if (coords.length < 2 || totalDistance <= 0) {
      return coords[0] || null;
    }

    const targetDist = progress * totalDistance;
    let segIdx = 0;

    for (let i = 0; i < cumulativeDistances.length - 1; i++) {
      if (
        targetDist >= cumulativeDistances[i] &&
        targetDist <= cumulativeDistances[i + 1]
      ) {
        segIdx = i;
        break;
      }
      if (i === cumulativeDistances.length - 2) {
        segIdx = i;
      }
    }

    const segStartDist = cumulativeDistances[segIdx];
    const segEndDist = cumulativeDistances[segIdx + 1];
    const segLen = Math.max(0.01, segEndDist - segStartDist);
    const alpha = Math.min(1, Math.max(0, (targetDist - segStartDist) / segLen));

    const p1 = coords[segIdx];
    const p2 = coords[segIdx + 1];

    const lat = p1[0] + alpha * (p2[0] - p1[0]);
    const lng = p1[1] + alpha * (p2[1] - p1[1]);

    // Check heading for facing direction
    const dLng = p2[1] - p1[1];
    if (dLng < -0.00005) {
      setFacing('left');
    } else if (dLng > 0.00005) {
      setFacing('right');
    }

    return [lat, lng];
  }, [progress, coords, cumulativeDistances, totalDistance]);

  // Create Custom Leaflet Marker Icon
  const characterIcon = useMemo(() => {
    const html = getGirlyCharacterMarkerHtml(isPlaying, facing, 46);
    return L.divIcon({
      html,
      className: 'custom-girly-leaflet-icon',
      iconSize: [46, 58],
      iconAnchor: [23, 56],
      popupAnchor: [0, -56],
    });
  }, [isPlaying, facing]);

  if (!route || !currentPos || coords.length < 2) return null;

  const metersCovered = Math.round(progress * (route.distanceMeters || totalDistance));
  const percentLabel = Math.round(progress * 100);

  return (
    <>
      {/* Geographically Anchored Character Marker */}
      <Marker position={currentPos} icon={characterIcon} zIndexOffset={1000}>
        <Popup className="herpath-popup">
          <div className="p-1 space-y-1 text-center font-sans">
            <div className="flex items-center justify-center gap-1 text-hotpink text-xs font-bold">
              <span>🎀</span>
              <span>HerPath Journey Mascot</span>
            </div>
            <div className="text-xs font-bold text-ink">
              {hasArrived ? 'Arrived at Destination! ✨' : `En Route along ${route.name}`}
            </div>
            <div className="text-[11px] text-soft-ink">
              {metersCovered}m / {Math.round(route.distanceMeters)}m ({percentLabel}%)
            </div>
          </div>
        </Popup>
      </Marker>

      {/* Floating Girly Journey Ribbon Controller on Map */}
      <div className="leaflet-bottom leaflet-right !pointer-events-auto" style={{ marginBottom: '84px', marginRight: '16px', zIndex: 900 }}>
        <div className="bg-white/95 backdrop-blur-md rounded-2xl border-2 border-white shadow-sticker p-2.5 flex items-center gap-2.5 select-none animate-modal">
          {/* Mascot Mini Tag */}
          <div className="flex items-center gap-1.5 pl-1">
            <span className="text-sm">🎀</span>
            <div className="flex flex-col">
              <span className="text-[10px] font-extrabold uppercase tracking-wide text-primary leading-none">
                Walk Preview
              </span>
              <span className="text-[11px] font-bold text-ink leading-tight mt-0.5">
                {hasArrived ? 'Completed! ✨' : `${percentLabel}% · ${metersCovered}m`}
              </span>
            </div>
          </div>

          {/* Mini Progress Bar */}
          <div className="w-16 h-2 rounded-full bg-lavender overflow-hidden border border-purple-200">
            <div
              style={{ width: `${percentLabel}%` }}
              className="h-full bg-primary rounded-full transition-all duration-100"
            />
          </div>

          {/* Play / Pause Toggle Button */}
          <button
            type="button"
            onClick={() => {
              if (hasArrived) {
                setProgress(0);
                setHasArrived(false);
                setIsPlaying(true);
              } else {
                setIsPlaying(!isPlaying);
              }
            }}
            className="w-8 h-8 rounded-full bg-primary hover:bg-primary-hover text-white flex items-center justify-center shadow-sm transition-transform active:scale-95"
            title={isPlaying ? 'Pause walk preview' : 'Play walk preview'}
            aria-label={isPlaying ? 'Pause walk preview' : 'Play walk preview'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white ml-0.5" />}
          </button>

          {/* Replay Button */}
          <button
            type="button"
            onClick={() => {
              setProgress(0);
              setHasArrived(false);
              setIsPlaying(true);
            }}
            className="w-8 h-8 rounded-full bg-lavender hover:bg-lilac text-primary flex items-center justify-center border border-purple-200 transition-colors"
            title="Replay from start"
            aria-label="Replay walk from beginning"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </>
  );
};
