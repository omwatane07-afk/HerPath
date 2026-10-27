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
  CheckCircle,
  FileSpreadsheet,
  Layers,
  ArrowUpRight,
  TrendingDown,
  Info,
} from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import { StreetlightStatusBadge, DisturbanceCategoryLabel, DataSourceBadge } from '../ui/Badge';

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
    <div className="flex flex-col h-full bg-navy-900 border-r border-slate-800 text-slate-100 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-teal-400" />
          <span>Civic Infrastructure Insights</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Civic repairs audit, lighting telemetry, and data coverage analysis
        </p>
      </div>

      <div className="p-4 space-y-5">
        {/* Transparency note */}
        <div className="p-3.5 rounded-xl bg-navy-950 border border-teal-500/30 text-xs text-slate-300 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-teal-300">Civic Focus:</strong> Infrastructure coverage gaps
            represent missing data or physical maintenance needs, not demographic judgments about
            neighbourhoods.
          </p>
        </div>

        {/* Top Summary Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Streetlight Health</span>
              <Lightbulb className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {Math.round((workingLights.length / Math.max(1, streetlights.length)) * 100)}%
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {workingLights.length} working • {activeOutages.length} active outages
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Community Reports</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-black text-white">{pendingReports.length + verifiedReports.length}</div>
            <div className="text-[11px] text-slate-400 mt-1">
              {verifiedReports.length} verified • {resolvedReports.length} resolved
            </div>
          </div>
        </div>

        {/* Priority Civic Maintenance Action Queue */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Civic Repair Priorities ({highPriorityIssues.length} items)
            </h3>
            <span className="text-[10px] text-teal-400 font-medium">Click to locate</span>
          </div>

          <div className="space-y-2.5">
            {highPriorityIssues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => onSelectCoordinate && onSelectCoordinate(issue.coords)}
                className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5">
                    {issue.type === 'lighting' ? (
                      <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                    )}
                    <span className="text-xs font-bold text-white group-hover:text-teal-300 transition-colors">
                      {issue.title}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      issue.urgency === 'high'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {issue.urgency} Priority
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{issue.desc}</p>
                <div className="flex items-center justify-between pt-2 mt-1 border-t border-slate-800/80 text-[11px] text-slate-500">
                  <span>Reported {formatRelativeTime(issue.timestamp)}</span>
                  <span className="text-teal-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    <span>View Coordinates</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data Coverage Gaps Table */}
        <div className="p-4 rounded-2xl bg-navy-950 border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>Infrastructure Coverage Audit</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-300">Streetlight Data Points</span>
              <span className="font-mono text-teal-400 font-bold">{streetlights.length} recorded</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-300">Mapped Women's & Essential Restrooms</span>
              <span className="font-mono text-teal-400 font-bold">
                {facilities.filter((f) => f.category === 'womens_restroom' || f.category === 'public_toilet').length} mapped
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-300">Emergency & 24/7 Police Desks</span>
              <span className="font-mono text-teal-400 font-bold">
                {facilities.filter((f) => f.category === 'police_station' || f.category === 'hospital').length} mapped
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-300">Transit Stops with Women Coaches</span>
              <span className="font-mono text-teal-400 font-bold">
                {transportStops.filter((t) => t.hasWomensCoach).length} stations
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
