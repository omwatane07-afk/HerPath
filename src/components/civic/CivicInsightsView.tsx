'use client';

import React from 'react';
import {
  StreetlightSegment,
  CommunityReport,
  EssentialFacility,
  TransportStop,
} from '@/types';
import {
  Lightbulb,
  Building2,
  ArrowUpRight,
  Info,
  Clock,
} from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import { DataSourceBadge } from '../ui/Badge';

interface CivicInsightsViewProps {
  streetlights: StreetlightSegment[];
  reports: CommunityReport[];
  facilities: EssentialFacility[];
  transportStops: TransportStop[];
  onSelectCoordinate?: (coords: { lat: number; lng: number }) => void;
}

export const CivicInsightsView: React.FC<CivicInsightsViewProps> = ({
  streetlights,
  reports,
  facilities,
  onSelectCoordinate,
}) => {
  const activeOutages = streetlights.filter(
    (s) => s.status === 'malfunctioning' || s.status === 'partial_outage'
  );
  const workingLights = streetlights.filter(
    (s) => s.status === 'working' || s.status === 'resolved'
  );

  const activeReports = reports.filter((r) => r.status !== 'resolved');

  // Maintenance items
  const maintenanceItems = [
    ...activeOutages.map((o) => ({
      id: o.id,
      category: 'Streetlight Luminaire' as const,
      title: o.segmentName,
      issue: o.notes || 'Luminaire unlit / partial dimming',
      coords: o.coordinates,
      timestamp: o.lastReportedAt,
      source: o.reportedSource,
      verified: o.verificationStatus === 'official_confirmed',
    })),
    ...activeReports
      .filter((r) => r.category === 'broken_footpath' || r.category === 'blocked_road')
      .map((f) => ({
        id: f.id,
        category: 'Pedestrian Footpath' as const,
        title: f.locationName,
        issue: f.description,
        coords: f.coordinates,
        timestamp: f.createdAt,
        source: f.source,
        verified: f.status === 'verified',
      })),
  ];

  return (
    <div className="flex flex-col h-full bg-card text-ink overflow-y-auto w-full font-sans">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-editorial text-xl sm:text-2xl font-bold text-ink">
              Civic Infrastructure Insights
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Physical infrastructure audits, lighting conditions, and mapped municipal gaps.
            </p>
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-champagne/15 text-champagne-dark border border-champagne/30">
            Sample Data
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-4 pb-24 lg:pb-8">
        {/* Prominent Truthfulness Principle */}
        <div className="p-4 rounded-card bg-canvas border border-border shadow-e1 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-ink">
            <Info className="w-4 h-4 text-primary" />
            <span className="font-editorial">Infrastructure Principle</span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Missing information indicates a data gap or potential physical maintenance need. It does not establish that a neighborhood is unsafe.
          </p>
        </div>

        {/* Hand-authored Isometric SVG Illustration in Nightbloom Palette */}
        <div className="surface-card p-4 text-center space-y-2 shadow-e1 border border-border">
          <div className="w-full max-w-[240px] mx-auto py-1">
            <svg width="220" height="90" viewBox="0 0 220 90" fill="none" aria-hidden="true" className="mx-auto">
              {/* Ground block */}
              <path d="M110 5L200 45L110 85L20 45Z" fill="#F7F3EE" stroke="#E4DCD3" strokeWidth="1.5" />
              <path d="M20 45L110 85V88L20 48Z" fill="#E4DCD3" />
              <path d="M110 85L200 45V48L110 88Z" fill="#867B72" />
              {/* Street walkway */}
              <path d="M70 30L150 70" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
              <path d="M70 30L150 70" stroke="#5A2FC2" strokeWidth="3" strokeDasharray="6 4" strokeLinecap="round" />
              {/* Isometric Streetlamp in Ink & Champagne */}
              <line x1="140" y1="40" x2="140" y2="15" stroke="#1E0F28" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M140 16C140 12 148 10 152 14" stroke="#1E0F28" strokeWidth="2" strokeLinecap="round" fill="none" />
              <circle cx="152" cy="15" r="3.5" fill="#C9A25E" />
              <circle cx="152" cy="15" r="7" stroke="#C9A25E" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
              {/* Building outline */}
              <path d="M50 35L80 20V45L50 60Z" fill="#FFFFFF" stroke="#1E0F28" strokeWidth="1.5" />
              <path d="M80 20L100 30V55L80 45Z" fill="#FBF8F4" stroke="#1E0F28" strokeWidth="1.5" />
            </svg>
          </div>
          <p className="text-[10px] uppercase font-bold text-text-muted tracking-wider font-mono">
            Illustration, not a map record
          </p>
        </div>

        {/* Scoped Summary Tiles */}
        <section aria-labelledby="audit-summary-heading" className="space-y-2">
          <h3 id="audit-summary-heading" className="font-editorial text-base font-bold text-ink">
            Corridor Infrastructure Evidence
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Streetlights Tile */}
            <div className="surface-card p-4 space-y-1.5 shadow-e1 border border-border">
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span className="font-semibold text-ink flex items-center gap-1.5 font-editorial">
                  <Lightbulb className="w-3.5 h-3.5 text-caution" />
                  Streetlights
                </span>
                <span className="text-[10px] font-mono">Connaught Place Ward</span>
              </div>

              <div className="font-editorial text-xl font-bold text-ink tabular-nums">
                {workingLights.length} working, {activeOutages.length} reported out
              </div>

              <p className="text-[11px] text-text-secondary leading-normal">
                Scope: 400m radius of active route corridors · Source: OpenStreetMap & Municipal demo records.
              </p>
            </div>

            {/* Essential Facilities Tile */}
            <div className="surface-card p-4 space-y-1.5 shadow-e1 border border-border">
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span className="font-semibold text-ink flex items-center gap-1.5 font-editorial">
                  <Building2 className="w-3.5 h-3.5 text-primary" />
                  Facilities
                </span>
                <span className="text-[10px] font-mono">Central Delhi</span>
              </div>

              <div className="font-editorial text-xl font-bold text-ink tabular-nums">
                {facilities.length} mapped support points
              </div>

              <p className="text-[11px] text-text-secondary leading-normal">
                Includes verified 24/7 pharmacies, women's restrooms, and railway police booths.
              </p>
            </div>
          </div>
        </section>

        {/* Documented Maintenance Observations */}
        <section aria-labelledby="maintenance-queue-heading" className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 id="maintenance-queue-heading" className="font-editorial text-base font-bold text-ink">
              Documented Maintenance Observations
            </h3>
            <span className="text-xs text-text-muted font-mono tabular-nums">
              {maintenanceItems.length} active issues
            </span>
          </div>

          <div className="space-y-2">
            {maintenanceItems.map((item) => (
              <div
                key={item.id}
                className="surface-card p-3.5 border border-border space-y-2 card-interactive"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                        {item.category}
                      </span>
                      {item.verified ? (
                        <span className="text-[10px] bg-verified-tint text-verified font-semibold px-1.5 py-0.5 rounded">
                          Municipal Audited
                        </span>
                      ) : (
                        <span className="text-[10px] bg-caution-tint text-caution font-semibold px-1.5 py-0.5 rounded">
                          Community Sourced
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-sm text-ink mt-0.5">{item.title}</h4>
                    <p className="text-xs text-text-secondary">{item.issue}</p>
                  </div>

                  <DataSourceBadge source={item.source} />
                </div>

                <div className="flex items-center justify-between text-[11px] text-text-muted pt-1 border-t border-border/60">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-text-muted" />
                    <span>Reported: {formatRelativeTime(item.timestamp)}</span>
                  </span>

                  {onSelectCoordinate && (
                    <button
                      type="button"
                      onClick={() => onSelectCoordinate(item.coords)}
                      className="text-primary hover:text-ink font-semibold flex items-center gap-1 focus-ring-primary rounded px-1.5 py-0.5"
                    >
                      <span>Locate on map</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
