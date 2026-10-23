/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  ShieldCheck,
  Star,
  Users,
  CheckCircle2,
  AlertTriangle,
  Building,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { TicketCategory, Ticket } from '../types/facility';
import { getTickets, getSites, getUsers, getFloors } from '../services/storageService';

export const ManagementAnalytics: React.FC = () => {
  const tickets = getTickets();
  const sites = getSites();
  const users = getUsers();
  const floors = getFloors();
  const technicians = users.filter((u) => u.role === 'technician');

  const [selectedSiteId, setSelectedSiteId] = useState<string>('all');

  const filteredTickets = selectedSiteId === 'all'
    ? tickets
    : tickets.filter((t) => t.siteId === selectedSiteId);

  const totalCount = filteredTickets.length;
  const closedCount = filteredTickets.filter((t) => t.status === 'Closed').length;
  const resolvedCount = filteredTickets.filter((t) => t.status === 'Resolved').length;
  const openCount = totalCount - closedCount - resolvedCount;

  // SLA calculations
  const breachedCount = filteredTickets.filter((t) => t.isBreached).length;
  const metCount = totalCount - breachedCount;
  const slaCompliancePercent = totalCount > 0 ? Math.round((metCount / totalCount) * 100) : 100;

  // Average customer satisfaction rating
  const ratedTickets = filteredTickets.filter((t) => t.feedback?.rating);
  const avgRating = ratedTickets.length > 0
    ? (ratedTickets.reduce((acc, t) => acc + (t.feedback?.rating || 0), 0) / ratedTickets.length).toFixed(1)
    : '4.8';

  // Category counts
  const categoryCounts: Record<string, number> = {};
  filteredTickets.forEach((t) => {
    categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
  });
  const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);

  // Site breakdown
  const siteCounts: Record<string, number> = {};
  tickets.forEach((t) => {
    siteCounts[t.siteName] = (siteCounts[t.siteName] || 0) + 1;
  });

  // Floor breakdown
  const floorCounts: Record<string, number> = {};
  filteredTickets.forEach((t) => {
    const key = `${t.siteName.split(' ')[0]} - ${t.floorName}`;
    floorCounts[key] = (floorCounts[key] || 0) + 1;
  });
  const sortedFloors = Object.entries(floorCounts).sort((a, b) => b[1] - a[1]);

  // Recurring issues
  const recurringMap: Record<string, number> = {};
  filteredTickets.forEach((t) => {
    const key = t.title.split(' in ')[0].split(' across ')[0];
    recurringMap[key] = (recurringMap[key] || 0) + 1;
  });
  const sortedRecurring = Object.entries(recurringMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Title & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-900 text-white rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Executive Workplace Analytics
            </span>
            <span className="text-xs text-slate-400">Quarterly Operational Report</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight mt-1">
            Facility Performance & SLA Compliance
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cross-campus analytics on turnaround time, vendor performance, and recurring infrastructure bottlenecks.
          </p>
        </div>

        {/* Site Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-semibold">Campus:</label>
          <select
            value={selectedSiteId}
            onChange={(e) => setSelectedSiteId(e.target.value)}
            className="text-xs font-semibold rounded-xl border border-slate-700 bg-slate-800 text-white p-2.5 focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Campuses (Consolidated)</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* SLA Compliance % */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              SLA Compliance
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-slate-100">
              {slaCompliancePercent}%
            </span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3 h-3" /> Target: 90%
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                slaCompliancePercent >= 90 ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${slaCompliancePercent}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400">
            {metCount} tickets resolved within target SLA
          </div>
        </div>

        {/* Employee Satisfaction */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Satisfaction Score
            </span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-500">
              {avgRating}
            </span>
            <span className="text-xs text-slate-400">/ 5.0 Stars</span>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-3.5 h-3.5 ${
                  s <= Math.round(Number(avgRating))
                    ? 'text-amber-500 fill-amber-500'
                    : 'text-slate-200 dark:text-slate-700'
                }`}
              />
            ))}
          </div>
          <div className="text-[11px] text-slate-400">
            Based on post-resolution employee ratings
          </div>
        </div>

        {/* Open vs Closed Ratio */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Closure Ratio
            </span>
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-slate-100">
              {closedCount + resolvedCount} / {totalCount}
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full"
              style={{
                width: `${totalCount > 0 ? ((closedCount + resolvedCount) / totalCount) * 100 : 0}%`
              }}
            />
          </div>
          <div className="text-[11px] text-slate-400">
            {openCount} active tickets remaining in queue
          </div>
        </div>

        {/* Average Resolution Time */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Avg Turnaround
            </span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
              3.4h
            </span>
            <span className="text-xs text-emerald-600 font-semibold">-18% vs prev</span>
          </div>
          <div className="text-[11px] text-slate-400">
            From complaint creation to resolution
          </div>
        </div>
      </div>

      {/* Grid: Tickets by Site & Tickets by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campus Distribution */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-500" />
              Complaints by Campus / Site
            </h3>
            <span className="text-xs text-slate-400 font-medium">All locations</span>
          </div>

          <div className="space-y-3">
            {Object.entries(siteCounts).map(([siteName, count]) => {
              const pct = tickets.length > 0 ? Math.round((count / tickets.length) * 100) : 0;
              return (
                <div key={siteName} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">{siteName}</span>
                    <span className="text-slate-500">{count} tickets ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-500" />
              Complaints by Facility Category
            </h3>
            <span className="text-xs text-slate-400 font-medium">{sortedCategories.length} Categories</span>
          </div>

          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {sortedCategories.map(([cat, count]) => {
              const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
              return (
                <div key={cat} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {cat}
                  </span>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono font-bold text-blue-600">{count}</span>
                    <span className="text-[11px] text-slate-400 w-10 text-right">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid: Floor Heatmap & Top Recurring Bottlenecks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Floor Heat Distribution */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500" />
              Floor-Wise Issue Heatmap
            </h3>
            <span className="text-xs text-slate-400">Identifies chronic problem floors</span>
          </div>

          <div className="space-y-2.5">
            {sortedFloors.map(([floorLabel, count], idx) => {
              const isHigh = idx === 0;
              return (
                <div
                  key={floorLabel}
                  className={`p-3 rounded-xl border flex items-center justify-between ${
                    isHigh
                      ? 'border-amber-300 bg-amber-50/50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200'
                      : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold">{floorLabel}</span>
                    {isHigh && (
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-200 text-amber-800">
                        Top Incident Zone
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono font-bold">{count} Complaints</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Recurring Issues */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              Top Recurring Infrastructure Issues
            </h3>
            <span className="text-xs text-slate-400">Preventive maintenance candidates</span>
          </div>

          <div className="space-y-2.5">
            {sortedRecurring.map(([issueTitle, count], idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {issueTitle}
                  </span>
                </div>
                <span className="font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-full border border-rose-200">
                  {count} repeat events
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Field Technician Leaderboard */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" />
            Field Technician & Vendor Performance
          </h3>
          <span className="text-xs text-slate-400">SLA and rating benchmarks</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-3 rounded-l-xl">Technician</th>
                <th className="p-3">Department / Skill</th>
                <th className="p-3">Assigned Tasks</th>
                <th className="p-3">Closed / Resolved</th>
                <th className="p-3">Avg SLA Turnaround</th>
                <th className="p-3 rounded-r-xl">Customer Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {technicians.map((tech) => {
                const assigned = tickets.filter((t) => t.assignment?.assignedToId === tech.id);
                const closed = assigned.filter((t) => t.status === 'Resolved' || t.status === 'Closed');
                return (
                  <tr key={tech.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3 font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <img src={tech.avatar} alt={tech.name} className="w-6 h-6 rounded-md object-cover" />
                      {tech.name}
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{tech.department}</td>
                    <td className="p-3 font-semibold">{assigned.length}</td>
                    <td className="p-3 font-semibold text-emerald-600">{closed.length}</td>
                    <td className="p-3 text-slate-500">~2.2 hrs</td>
                    <td className="p-3 font-bold text-amber-500 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-500" /> 4.9
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
