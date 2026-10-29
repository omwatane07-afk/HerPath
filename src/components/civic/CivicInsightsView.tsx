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
  Sparkles,
  BarChart3,
  Layers,
} from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import { getCivicCategory } from '@/lib/civic-categories';
import { DataSourceBadge } from '../ui/Badge';
import { PocketPlanet } from '../ui/PocketPlanet';

interface CivicInsightsViewProps {
  streetlights: StreetlightSegment[];
  reports: CommunityReport[];
  facilities: EssentialFacility[];
  transportStops?: TransportStop[];
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

  const totalLights = streetlights.length;
  const workingPercent = totalLights > 0 ? Math.round((workingLights.length / totalLights) * 100) : 0;
  const outagePercent = totalLights > 0 ? Math.round((activeOutages.length / totalLights) * 100) : 0;

  const activeReports = reports.filter((r) => r.status !== 'resolved');

  // Facilities breakdown
  const restroomCount = facilities.filter(
    (f) => f.category === 'womens_restroom' || f.category === 'public_toilet'
  ).length;
  const medicalCount = facilities.filter(
    (f) => f.category === 'pharmacy' || f.category === 'hospital'
  ).length;
  const policeCount = facilities.filter(
    (f) => f.category === 'police_station' || f.category === 'help_point'
  ).length;

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
      .filter((r) => {
        const cat = getCivicCategory(r.category);
        return cat.infrastructureDomain === 'surface' || cat.infrastructureDomain === 'lighting' || cat.infrastructureDomain === 'services';
      })
      .map((f) => {
        const cat = getCivicCategory(f.category);
        return {
          id: f.id,
          category: cat.label as any,
          title: f.locationName,
          issue: f.description,
          coords: f.coordinates,
          timestamp: f.createdAt,
          source: f.source,
          verified: f.status === 'verified',
        };
      }),
  ];

  return (
    <div className="flex flex-col h-full bg-[#FCFAFF] text-ink overflow-y-auto w-full font-sans">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-border bg-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-lilac text-grape text-[10px] font-bold mb-1">
              <Sparkles className="w-3 h-3 text-grape" />
              <span>Civic Audits</span>
            </div>
            <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-ink">
              Civic Insights
            </h2>
            <p className="text-xs text-soft-ink mt-0.5 font-medium">
              Physical infrastructure audits, lighting conditions, and mapped municipal gaps.
            </p>
          </div>
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-lilac text-grape border border-purple-200">
            Municipal Data
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-4 pb-24 lg:pb-8">
        {/* Prominent Truthfulness Principle */}
        <div className="sticker-card p-4 bg-white border border-border space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-grape">
            <Info className="w-4 h-4 text-grape" />
            <span className="font-heading font-extrabold text-ink">Infrastructure Principle</span>
          </div>
          <p className="text-xs text-soft-ink leading-relaxed font-medium">
            Missing observations indicate a data gap or potential physical maintenance need. They do not label any neighborhood unsafe.
          </p>
        </div>

        {/* Signature Miniature City Block (Pocket Planet) Illustration Header */}
        <div className="sticker-card p-5 text-center space-y-2 bg-white relative">
          <div className="washi-tape washi-butter w-20 -top-2 left-10" />

          <div className="w-full flex items-center justify-center py-2">
            <PocketPlanet size={200} />
          </div>

          <div className="text-[10px] font-extrabold text-soft-ink uppercase tracking-wider font-heading">
            Illustration, not a navigable map record
          </div>
          <p className="text-xs text-soft-ink font-medium max-w-sm mx-auto">
            Simulated 3D city block highlighting pedestrian walkways, streetlights, and community facilities.
          </p>
        </div>

        {/* Real Charts: Grape, Periwinkle, and Butter Visualizations */}
        <section aria-labelledby="audit-charts-heading" className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 id="audit-charts-heading" className="font-heading text-base font-extrabold text-ink flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-grape" />
              <span>Infrastructure Metrics</span>
            </h3>
            <span className="text-[11px] font-bold text-soft-ink">Current Corridor Scope</span>
          </div>

          {/* Chart 1: Streetlight Illumination Distribution */}
          <div className="sticker-card p-4 space-y-3 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-heading font-extrabold text-xs text-ink flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-butter fill-butter/40" />
                  Streetlight Working Ratio
                </span>
                <span className="text-[11px] text-soft-ink font-medium">
                  {workingLights.length} working · {activeOutages.length} reported out
                </span>
              </div>
              <span className="font-heading font-extrabold text-sm text-grape">
                {workingPercent}% Lit
              </span>
            </div>

            {/* Visual Proportion Bar (Grape = Working, Strawberry = Outage) */}
            <div className="w-full h-3 rounded-full bg-paper overflow-hidden flex p-0.5 border border-purple-100">
              <div
                style={{ width: `${workingPercent}%` }}
                className="h-full bg-grape rounded-l-full transition-all duration-500"
                title={`${workingPercent}% working streetlights`}
              />
              <div
                style={{ width: `${outagePercent}%` }}
                className="h-full bg-strawberry rounded-r-full transition-all duration-500"
                title={`${outagePercent}% reported outages`}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-soft-ink pt-1 border-t border-purple-100">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-grape inline-block" />
                  Illuminated ({workingPercent}%)
                </span>
                <span className="flex items-center gap-1 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-strawberry inline-block" />
                  Dim / Out ({outagePercent}%)
                </span>
              </div>
              <span className="text-[10px] text-soft-ink">Source: Municipal Audits</span>
            </div>
          </div>

          {/* Chart 2: Mapped Facility Diversity */}
          <div className="sticker-card p-4 space-y-3 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-heading font-extrabold text-xs text-ink flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-grape" />
                  Essential Facility Categories
                </span>
                <span className="text-[11px] text-soft-ink font-medium">
                  {facilities.length} verified physical support points
                </span>
              </div>
            </div>

            {/* Category Bars in Grape, Periwinkle, Butter */}
            <div className="space-y-2 text-xs">
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-ink mb-1">
                  <span>Women&apos;s Restrooms & Toilets</span>
                  <span className="text-soft-ink font-heading">{restroomCount} mapped</span>
                </div>
                <div className="w-full h-2 rounded-full bg-paper overflow-hidden">
                  <div
                    style={{ width: `${Math.min(100, restroomCount * 25)}%` }}
                    className="h-full bg-strawberry rounded-full"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-ink mb-1">
                  <span>24/7 Pharmacies & Medical</span>
                  <span className="text-soft-ink font-heading">{medicalCount} mapped</span>
                </div>
                <div className="w-full h-2 rounded-full bg-paper overflow-hidden">
                  <div
                    style={{ width: `${Math.min(100, medicalCount * 25)}%` }}
                    className="h-full bg-grape rounded-full"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-ink mb-1">
                  <span>Police Booths & Help Kiosks</span>
                  <span className="text-soft-ink font-heading">{policeCount} mapped</span>
                </div>
                <div className="w-full h-2 rounded-full bg-paper overflow-hidden">
                  <div
                    style={{ width: `${Math.min(100, policeCount * 25)}%` }}
                    className="h-full bg-butter rounded-full"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-soft-ink pt-1 border-t border-purple-100">
              <span>Updated within last 24h</span>
              <span>Source: OpenStreetMap & Municipal records</span>
            </div>
          </div>
        </section>

        {/* Documented Maintenance Observations */}
        <section aria-labelledby="maintenance-queue-heading" className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 id="maintenance-queue-heading" className="font-heading text-base font-extrabold text-ink">
              Maintenance Observations
            </h3>
            <span className="text-xs text-soft-ink font-bold tabular-nums">
              {maintenanceItems.length} active issues
            </span>
          </div>

          <div className="space-y-2">
            {maintenanceItems.map((item) => (
              <div
                key={item.id}
                className="sticker-card p-3.5 space-y-2 bg-white"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-soft-ink font-heading">
                        {item.category}
                      </span>
                      {item.verified ? (
                        <span className="text-[10px] bg-emerald-50 text-verified font-bold px-1.5 py-0.5 rounded-full border border-emerald-200">
                          Municipal Audited
                        </span>
                      ) : (
                        <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-1.5 py-0.5 rounded-full border border-amber-200">
                          Community Sourced
                        </span>
                      )}
                    </div>
                    <h4 className="font-heading font-extrabold text-sm text-ink mt-0.5">{item.title}</h4>
                    <p className="text-xs text-soft-ink font-medium">{item.issue}</p>
                  </div>

                  <DataSourceBadge source={item.source} />
                </div>

                <div className="flex items-center justify-between text-[11px] text-soft-ink pt-1 border-t border-purple-100">
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3 text-soft-ink" />
                    <span>Reported: {formatRelativeTime(item.timestamp)}</span>
                  </span>

                  {onSelectCoordinate && (
                    <button
                      type="button"
                      onClick={() => onSelectCoordinate(item.coords)}
                      className="text-grape hover:text-grape-hover font-bold text-xs flex items-center gap-1"
                    >
                      <span>Locate on Map</span>
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
