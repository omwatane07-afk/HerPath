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
  ShieldCheck,
  Layers,
  ArrowUpRight,
  Info,
} from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

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
  // Compute civic metrics
  const activeOutages = streetlights.filter(
    (s) => s.status === 'malfunctioning' || s.status === 'partial_outage'
  );
  const resolvedLights = streetlights.filter((s) => s.status === 'resolved');
  const workingLights = streetlights.filter((s) => s.status === 'working');

  const pendingReports = reports.filter((r) => r.status === 'pending');
  const verifiedReports = reports.filter((r) => r.status === 'verified');
  const resolvedReports = reports.filter((r) => r.status === 'resolved');

  // Identify infrastructure hotspots / priority repair segments
  const highPriorityIssues = [
    ...activeOutages.map((o) => ({
      type: 'lighting' as const,
      id: o.id,
      title: o.segmentName,
      desc: o.notes || 'Streetlight outage reported',
      coords: o.coordinates,
      timestamp: o.lastReportedAt,
      urgency: 'high' as const,
    })),
    ...reports
      .filter((r) => r.status !== 'resolved' && r.category === 'broken_footpath')
      .map((f) => ({
        type: 'footpath' as const,
        id: f.id,
        title: f.locationName,
        desc: f.description,
        coords: f.coordinates,
        timestamp: f.createdAt,
        urgency: 'medium' as const,
      })),
  ];

  return (
    <div className="flex flex-col h-full bg-brand-bg text-brand-text overflow-y-auto w-full">
      {/* Header */}
      <div className="p-3.5 sm:p-5 border-b border-brand-border/70 glass-pearl">
        <h2 className="text-base sm:text-lg font-black text-brand-text flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-200/90 shadow-xs ring-1 ring-champagne-300/60">
            <Layers className="w-4 h-4 text-teal-600" />
          </div>
          <span>Civic Infrastructure Insights</span>
        </h2>
        <p className="text-[11px] sm:text-xs text-brand-text-secondary mt-1 font-medium leading-relaxed">
          Civic repairs audit, lighting telemetry, and data coverage analysis
        </p>
      </div>

      <div className="p-3.5 sm:p-5 space-y-4 sm:space-y-5 pb-24 lg:pb-8">
        {/* Transparency note */}
        <div className="p-3.5 sm:p-4 rounded-royal bg-teal-50/80 border border-teal-100 text-xs text-teal-900 flex items-start gap-2.5 shadow-xs">
          <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">
            <strong className="text-teal-950 font-bold">Civic Focus:</strong> Infrastructure coverage gaps
            represent missing observations or physical maintenance needs, not demographic judgments about neighbourhoods.
          </p>
        </div>

        {/* Top Summary Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-royal surface-pearl border border-brand-border/80 shadow-card">
            <div className="flex items-center justify-between text-xs text-brand-text-secondary mb-1 font-medium">
              <span>Streetlight Health</span>
              <Lightbulb className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-3xl font-black text-brand-text">
              {Math.round((workingLights.length / Math.max(1, streetlights.length)) * 100)}%
            </div>
            <div className="text-[11px] text-brand-text-secondary mt-1 font-medium">
              {workingLights.length} working • {activeOutages.length} active outages
            </div>
          </div>

          <div className="p-4 rounded-royal surface-pearl border border-brand-border/80 shadow-card">
            <div className="flex items-center justify-between text-xs text-brand-text-secondary mb-1 font-medium">
              <span>Community Reports</span>
              <AlertTriangle className="w-4 h-4 text-danger-500" />
            </div>
            <div className="text-3xl font-black text-brand-text">
              {pendingReports.length + verifiedReports.length}
            </div>
            <div className="text-[11px] text-brand-text-secondary mt-1 font-medium">
              {verifiedReports.length} verified • {resolvedReports.length} resolved
            </div>
          </div>
        </div>

        {/* Priority Civic Maintenance Action Queue */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text-muted">
              Civic Repair Priorities ({highPriorityIssues.length} items)
            </h3>
            <span className="text-[11px] text-teal-700 font-bold">Tap to locate</span>
          </div>

          <div className="space-y-2.5">
            {highPriorityIssues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => onSelectCoordinate && onSelectCoordinate(issue.coords)}
                className="p-4 rounded-royal surface-pearl border border-brand-border/80 shadow-card hover:border-teal-200 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    {issue.type === 'lighting' ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-danger-500 animate-pulse" />
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    )}
                    <span className="text-xs font-bold text-brand-text group-hover:text-teal-700 transition-colors">
                      {issue.title}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase shadow-xs ${
                      issue.urgency === 'high'
                        ? 'bg-danger-50 text-danger-700 border border-danger-200'
                        : 'bg-warning-50 text-warning-700 border border-warning-200'
                    }`}
                  >
                    {issue.urgency} Priority
                  </span>
                </div>
                <p className="text-xs text-brand-text-secondary leading-relaxed font-medium">{issue.desc}</p>
                <div className="flex items-center justify-between pt-2.5 mt-1 border-t border-brand-border/70 text-[11px] text-brand-text-muted font-medium">
                  <span>Reported {formatRelativeTime(issue.timestamp)}</span>
                  <span className="text-teal-700 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 font-bold">
                    <span>View Map Position</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data Coverage Gaps Table */}
        <div className="p-5 rounded-royal surface-pearl border border-brand-border/80 shadow-card space-y-3.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Infrastructure Coverage Audit</span>
          </h3>

          <div className="space-y-2.5 text-xs font-medium">
            <div className="flex items-center justify-between py-1.5 border-b border-brand-border/70">
              <span className="text-brand-text-secondary">Streetlight Data Points</span>
              <span className="font-mono text-teal-700 font-bold">{streetlights.length} recorded</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-brand-border/70">
              <span className="text-brand-text-secondary">Mapped Women's & Essential Restrooms</span>
              <span className="font-mono text-teal-700 font-bold">
                {facilities.filter((f) => f.category === 'womens_restroom' || f.category === 'public_toilet').length} mapped
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-brand-border/70">
              <span className="text-brand-text-secondary">Emergency & 24/7 Police Desks</span>
              <span className="font-mono text-teal-700 font-bold">
                {facilities.filter((f) => f.category === 'police_station' || f.category === 'hospital').length} mapped
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-brand-text-secondary">Transit Stops with Women Coaches</span>
              <span className="font-mono text-teal-700 font-bold">
                {transportStops.filter((t) => t.hasWomensCoach).length} stations
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
