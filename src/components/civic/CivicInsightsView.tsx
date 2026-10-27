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
  AlertTriangle,
  Layers,
  ArrowUpRight,
  Info,
  Clock,
  CheckCircle2,
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
  transportStops,
  onSelectCoordinate,
}) => {
  const activeOutages = streetlights.filter(
    (s) => s.status === 'malfunctioning' || s.status === 'partial_outage'
  );
  const workingLights = streetlights.filter(
    (s) => s.status === 'working' || s.status === 'resolved'
  );

  const activeReports = reports.filter((r) => r.status !== 'resolved');

  // Maintence issues
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
    <div className="flex flex-col h-full bg-paper text-ink overflow-y-auto w-full">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-border bg-white shadow-e1">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-ink">Civic Infrastructure Insights</h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Physical infrastructure audits, lighting conditions, and mapped municipal gaps.
            </p>
          </div>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-raised text-text-secondary border border-border">
            Sample Data
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-4 pb-24 lg:pb-8">
        {/* Prominent Truthfulness Principle */}
        <div className="p-4 rounded-card bg-white border border-border shadow-e1 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-ink">
            <Info className="w-4 h-4 text-peacock" />
            <span>Infrastructure Principle</span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Missing information indicates a data gap or potential physical maintenance need. It does not establish that a neighborhood is unsafe.
          </p>
        </div>

        {/* Hand-authored Isometric SVG Illustration (Effect #13) */}
        <div className="surface-card p-4 text-center space-y-2 shadow-e1">
          <div className="w-full max-w-[240px] mx-auto py-1">
            <svg width="220" height="90" viewBox="0 0 220 90" fill="none" aria-hidden="true" className="mx-auto">
              {/* Ground block */}
              <path d="M110 5L200 45L110 85L20 45Z" fill="#F8F4EC" stroke="#E3DCCD" strokeWidth="1.5" />
              <path d="M20 45L110 85V88L20 48Z" fill="#E3DCCD" />
              <path d="M110 85L200 45V48L110 88Z" fill="#B9AF99" />
              {/* Street walkway */}
              <path d="M70 30L150 70" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
              <path d="M70 30L150 70" stroke="#0E7C86" strokeWidth="3" strokeDasharray="6 4" strokeLinecap="round" />
              {/* Isometric Streetlamp */}
              <line x1="140" y1="40" x2="140" y2="15" stroke="#14213D" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M140 16C140 12 148 10 152 14" stroke="#14213D" strokeWidth="2" strokeLinecap="round" fill="none" />
              <circle cx="152" cy="15" r="3.5" fill="#D8A58E" />
              <circle cx="152" cy="15" r="7" stroke="#D8A58E" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
              {/* Building outline */}
              <path d="M50 35L80 20V45L50 60Z" fill="#FFFFFF" stroke="#14213D" strokeWidth="1.5" />
              <path d="M80 20L100 30V55L80 45Z" fill="#F1EBDD" stroke="#14213D" strokeWidth="1.5" />
            </svg>
          </div>
          <p className="text-[10px] uppercase font-bold text-text-muted tracking-wider">
            Illustration, not a map record
          </p>
        </div>

        {/* Scoped Summary Tiles (Truthful Scoped Explanations, NO unexplained percentages!) */}
        <section aria-labelledby="audit-summary-heading" className="space-y-2">
          <h3 id="audit-summary-heading" className="font-serif text-base font-bold text-ink">
            Corridor Infrastructure Evidence
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Streetlights Tile */}
            <div className="surface-card p-4 space-y-1.5 shadow-e1">
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span className="font-semibold text-ink flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-caution" />
                  Streetlights
                </span>
                <span className="text-[10px] font-mono">Connaught Place Ward</span>
              </div>

              <div className="font-serif text-xl font-bold text-ink">
                {workingLights.length} working, {activeOutages.length} reported out
              </div>

              <p className="text-[11px] text-text-secondary leading-normal">
                Scope: 400m radius of active route corridors · Source: OpenStreetMap & Municipal demo records.
              </p>
            </div>

            {/* Essential Facilities Tile */}
            <div className="surface-card p-4 space-y-1.5 shadow-e1">
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span className="font-semibold text-ink flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-peacock" />
                  Facilities
                </span>
                <span className="text-[10px] font-mono">Central Delhi</span>
              </div>

              <div className="font-serif text-xl font-bold text-ink">
                {facilities.length} mapped support points
              </div>

              <p className="text-[11px] text-text-secondary leading-normal">
                Includes verified 24/7 pharmacies, women’s restrooms, and railway police booths.
              </p>
            </div>
          </div>
        </section>

        {/* Maintenance Items List */}
        <section aria-labelledby="maintenance-heading" className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 id="maintenance-heading" className="font-serif text-base font-bold text-ink">
              Documented Maintenance Observations
            </h3>
            <span className="text-xs text-text-secondary">
              {maintenanceItems.length} active issues
            </span>
          </div>

          <div className="space-y-2.5">
            {maintenanceItems.map((item) => (
              <div
                key={item.id}
                className="surface-card p-3.5 space-y-2 shadow-e1 card-interactive"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-caution-dark">
                      {item.category}
                    </span>
                    <h4 className="font-bold text-sm text-ink">{item.title}</h4>
                    <p className="text-xs text-text-secondary mt-0.5">{item.issue}</p>
                  </div>
                  <DataSourceBadge source={item.source} />
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-text-secondary">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-text-secondary" />
                    <span>Reported {formatRelativeTime(item.timestamp)}</span>
                  </div>

                  {onSelectCoordinate && (
                    <button
                      type="button"
                      onClick={() => onSelectCoordinate(item.coords)}
                      className="text-peacock-dark hover:text-ink font-semibold flex items-center gap-1 text-xs focus-ring-peacock"
                    >
                      <span>View on map</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
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
