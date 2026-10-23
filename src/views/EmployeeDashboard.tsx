/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Camera,
  Star,
  Search,
  Filter,
  ArrowRight
} from 'lucide-react';
import { Ticket, TicketStatus } from '../types/facility';
import { SlaBadge } from '../components/SlaBadge';
import { getTickets, getActiveUser } from '../services/storageService';

interface EmployeeDashboardProps {
  onSelectTicket: (ticket: Ticket) => void;
  onOpenRaiseModal: () => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({
  onSelectTicket,
  onOpenRaiseModal
}) => {
  const currentUser = getActiveUser();
  const allTickets = getTickets();

  // Tickets created by this employee (or all if simulated view)
  const myTickets = allTickets.filter(
    (t) => t.createdById === currentUser.id || currentUser.role === 'admin'
  );

  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'resolved' | 'closed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const activeTickets = myTickets.filter(
    (t) => t.status === 'Open' || t.status === 'Supervisor Review' || t.status === 'Assigned' || t.status === 'In Progress' || t.status === 'On Hold' || t.status === 'Reopened'
  );
  const resolvedTickets = myTickets.filter((t) => t.status === 'Resolved');
  const closedTickets = myTickets.filter((t) => t.status === 'Closed');

  const filteredTickets = myTickets.filter((t) => {
    if (statusFilter === 'active') {
      if (t.status === 'Resolved' || t.status === 'Closed' || t.status === 'Cancelled') return false;
    }
    if (statusFilter === 'resolved') {
      if (t.status !== 'Resolved') return false;
    }
    if (statusFilter === 'closed') {
      if (t.status !== 'Closed') return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.ticketNumber.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.areaName.toLowerCase().includes(q) ||
        t.siteName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 p-6 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm">
                Employee Portal • {currentUser.department}
              </span>
              <span className="text-xs text-blue-200">
                {currentUser.name}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-2">
              Facility Helpdesk & Workspace Support
            </h1>
            <p className="text-sm text-blue-100 mt-1 max-w-xl">
              Facing an issue with AC cooling, plumbing leaks, electrical power, or furniture? Raise a ticket in under 1 minute with guaranteed SLA response times.
            </p>
          </div>

          <button
            onClick={onOpenRaiseModal}
            className="px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-white text-blue-700 hover:bg-blue-50 active:scale-95 shadow-lg transition flex items-center gap-2 shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-blue-600" />
            <span>Raise New Complaint</span>
          </button>
        </div>
      </div>

      {/* Action Required Alert: Resolved complaints awaiting review */}
      {resolvedTickets.length > 0 && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-300 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <h2 className="text-sm font-bold text-emerald-950 dark:text-emerald-100">
                {resolvedTickets.length} Complaint{resolvedTickets.length > 1 ? 's' : ''} Resolved - Action Required
              </h2>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                The facility team has completed the work. Please inspect and provide your 5-star rating to confirm closure.
              </p>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter('resolved')}
            className="px-4 py-2 text-xs font-bold text-emerald-800 bg-emerald-200/70 hover:bg-emerald-200 rounded-xl transition whitespace-nowrap self-start sm:self-auto"
          >
            Review & Rate Now →
          </button>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-blue-50/70 border-blue-400 dark:bg-blue-950/40'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Complaints
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
            {myTickets.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">All tickets logged</div>
        </div>

        <div
          onClick={() => setStatusFilter('active')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            statusFilter === 'active'
              ? 'bg-amber-50/70 border-amber-400 dark:bg-amber-950/40'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Active In-Progress
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
            {activeTickets.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Under technician resolution</div>
        </div>

        <div
          onClick={() => setStatusFilter('resolved')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            statusFilter === 'resolved'
              ? 'bg-emerald-50/70 border-emerald-400 dark:bg-emerald-950/40'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Resolved (Awaiting Rating)
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {resolvedTickets.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Ready for confirmation</div>
        </div>

        <div
          onClick={() => setStatusFilter('closed')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            statusFilter === 'closed'
              ? 'bg-slate-100 border-slate-400 dark:bg-slate-800'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Closed & Confirmed
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
            {closedTickets.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Successfully resolved</div>
        </div>
      </div>

      {/* Ticket List Header & Search */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              My Facility Complaints
            </h2>
            <span className="text-xs text-slate-400">({filteredTickets.length})</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search ticket, category, room..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-9 pr-3 py-2 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {(['all', 'active', 'resolved', 'closed'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg capitalize transition ${
                    statusFilter === tab
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Complaints List Cards */}
        {filteredTickets.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              No Complaints Found
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Everything in your workspace seems to be running smoothly! Click below if you need to report any facility issues.
            </p>
            <button
              onClick={onOpenRaiseModal}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-xs"
            >
              Raise Complaint Now
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => onSelectTicket(ticket)}
                className="p-4 sm:p-5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {ticket.ticketNumber}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        ticket.status === 'Resolved'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : ticket.status === 'Closed'
                          ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          : ticket.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {ticket.status}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      • {ticket.category}
                    </span>
                    <SlaBadge ticket={ticket} compact />
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition truncate">
                    {ticket.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      {ticket.siteName} → {ticket.floorName} ({ticket.areaName})
                    </span>
                    <span>•</span>
                    <span>
                      Logged {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                    {ticket.assignment && (
                      <>
                        <span>•</span>
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          Assigned to: {ticket.assignment.assignedToName}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                  {ticket.photoUrls.length > 0 && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                      <Camera className="w-3 h-3" />
                      <span>{ticket.photoUrls.length}</span>
                    </div>
                  )}

                  {ticket.status === 'Resolved' && (
                    <span className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 rounded-xl shadow-xs animate-bounce">
                      Review & Close ★
                    </span>
                  )}

                  <div className="p-2 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
