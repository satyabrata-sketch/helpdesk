/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  AlertTriangle,
  UserCheck,
  Clock,
  CheckCircle2,
  Filter,
  Search,
  Wrench,
  ShieldAlert,
  ArrowRight,
  Send,
  Building,
  Layers
} from 'lucide-react';
import { Ticket, TicketCategory, PriorityLevel, TicketStatus } from '../types/facility';
import { SlaBadge } from '../components/SlaBadge';
import {
  getTickets,
  getSites,
  getUsers,
  getActiveUser,
  assignTicket,
  addNotification
} from '../services/storageService';

interface SupervisorDashboardProps {
  onSelectTicket: (ticket: Ticket) => void;
  onOpenRaiseModal: () => void;
}

export const SupervisorDashboard: React.FC<SupervisorDashboardProps> = ({
  onSelectTicket,
  onOpenRaiseModal
}) => {
  const currentUser = getActiveUser();
  const sites = getSites();
  const allUsers = getUsers();
  const technicians = allUsers.filter((u) => u.role === 'technician');
  const tickets = getTickets();

  const [siteFilter, setSiteFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Quick Dispatch modal state
  const [dispatchTicket, setDispatchTicket] = useState<Ticket | null>(null);
  const [selectedTechId, setSelectedTechId] = useState('');
  const [dispatchNote, setDispatchNote] = useState('');

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    if (siteFilter !== 'all' && t.siteId !== siteFilter) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.ticketNumber.toLowerCase().includes(q) ||
        t.areaName.toLowerCase().includes(q) ||
        t.createdByName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // KPI calculations
  const unassignedTickets = tickets.filter((t) => !t.assignment && t.status !== 'Closed' && t.status !== 'Resolved');
  const breachedTickets = tickets.filter((t) => t.isBreached && t.status !== 'Closed' && t.status !== 'Resolved');
  const inProgressTickets = tickets.filter((t) => t.status === 'In Progress');
  const criticalTickets = tickets.filter((t) => t.priority === 'Critical' && t.status !== 'Closed');

  const handleOpenDispatch = (ticket: Ticket, e: React.MouseEvent) => {
    e.stopPropagation();
    setDispatchTicket(ticket);
    // Auto-suggest technician matching specialty
    const matchingTech = technicians.find((tech) => tech.specialty?.includes(ticket.category)) || technicians[0];
    setSelectedTechId(matchingTech ? matchingTech.id : '');
    setDispatchNote('');
  };

  const handleConfirmDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchTicket || !selectedTechId) return;
    assignTicket(dispatchTicket.id, selectedTechId, dispatchNote.trim());
    setDispatchTicket(null);
  };

  const handleEscalateBreach = (ticket: Ticket, e: React.MouseEvent) => {
    e.stopPropagation();
    addNotification({
      recipientId: ticket.assignment?.assignedToId || 'all_supervisors',
      title: `URGENT SLA ESCALATION: ${ticket.ticketNumber}`,
      message: `Facility Supervisor escalated overdue complaint: "${ticket.title}". Immediate on-site presence required.`,
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber,
      type: 'sla_warning'
    });
    alert(`Escalation alert broadcasted for ${ticket.ticketNumber} to assigned technicians.`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900 text-white rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Supervisor Dispatch & SLA Command
            </span>
            <span className="text-xs text-slate-400">
              Logged in as {currentUser.name}
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight mt-1">
            Facility Operations Triage & SLA Monitor
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor incoming complaints across campuses, assign field technicians, and prevent SLA breaches.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenRaiseModal}
            className="px-4 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-md whitespace-nowrap"
          >
            + Log Walk-in Complaint
          </button>
        </div>
      </div>

      {/* SLA Alert Warnings */}
      {breachedTickets.length > 0 && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-300 dark:border-rose-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold shrink-0 animate-bounce">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-rose-900 dark:text-rose-100">
                {breachedTickets.length} SLA Breach{breachedTickets.length > 1 ? 'es' : ''} Detected
              </h2>
              <p className="text-xs text-rose-700 dark:text-rose-300">
                Target resolution timeframe has passed for these tickets. Fast-track dispatch or escalate immediately.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setStatusFilter('all');
              setPriorityFilter('all');
              setCategoryFilter('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 text-xs font-bold text-rose-800 bg-rose-200/80 hover:bg-rose-200 rounded-xl transition whitespace-nowrap"
          >
            Filter Breached Tickets →
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div
          onClick={() => setStatusFilter(statusFilter === 'Open' ? 'all' : 'Open')}
          className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 cursor-pointer transition shadow-xs"
        >
          <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Unassigned / Needs Triage
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
            {unassignedTickets.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Awaiting technician assignment</div>
        </div>

        <div
          onClick={() => setPriorityFilter(priorityFilter === 'Critical' ? 'all' : 'Critical')}
          className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-rose-400 cursor-pointer transition shadow-xs"
        >
          <div className="text-xs font-semibold text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> Critical Incidents
          </div>
          <div className="text-2xl font-black text-rose-600 mt-1">
            {criticalTickets.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">High operational business impact</div>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === 'In Progress' ? 'all' : 'In Progress')}
          className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-400 cursor-pointer transition shadow-xs"
        >
          <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5" /> In-Progress Work
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
            {inProgressTickets.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Technicians active on-site</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Total Active Tickets
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
            {tickets.filter((t) => t.status !== 'Closed').length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across all locations</div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by ticket #, description, room, or reporter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-9 pr-3 py-2 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Site Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto py-1">
            <button
              onClick={() => setSiteFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition ${
                siteFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              All Sites
            </button>
            {sites.map((s) => (
              <button
                key={s.id}
                onClick={() => setSiteFilter(s.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition ${
                  siteFilter === s.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {s.city} ({s.code})
              </button>
            ))}
          </div>
        </div>

        {/* Secondary dropdown filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1.5 text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Statuses</option>
              <option value="Open">Open (Unassigned)</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="On Hold">On Hold</option>
              <option value="Resolved">Resolved</option>
              <option value="Reopened">Reopened</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1.5 text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1.5 text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Categories</option>
              <option value="Cleaning / Housekeeping">Cleaning / Housekeeping</option>
              <option value="Electrical (E&M)">Electrical (E&M)</option>
              <option value="Plumbing">Plumbing</option>
              <option value="HVAC / Air Conditioning">HVAC / Air Conditioning</option>
              <option value="Carpentry">Carpentry</option>
              <option value="Civil Works">Civil Works</option>
              <option value="Pest Control">Pest Control</option>
              <option value="Furniture">Furniture</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSiteFilter('all');
                setStatusFilter('all');
                setPriorityFilter('all');
                setCategoryFilter('all');
                setSearchQuery('');
              }}
              className="w-full py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 dark:bg-slate-800 rounded-lg transition"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Triage Ticket List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Operational Triage Queue
            </h2>
            <span className="text-xs text-slate-400">({filteredTickets.length} tickets)</span>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredTickets.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No tickets matching current filters.
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => onSelectTicket(ticket)}
                className={`p-4 sm:p-5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition flex flex-col md:flex-row md:items-center justify-between gap-4 group ${
                  ticket.isBreached && ticket.status !== 'Closed' && ticket.status !== 'Resolved'
                    ? 'border-l-4 border-l-rose-500 bg-rose-50/30 dark:bg-rose-950/10'
                    : ''
                }`}
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {ticket.ticketNumber}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        ticket.priority === 'Critical'
                          ? 'bg-rose-100 text-rose-700 border border-rose-300'
                          : ticket.priority === 'High'
                          ? 'bg-amber-100 text-amber-700 border border-amber-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800'
                      }`}
                    >
                      {ticket.priority}
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        ticket.status === 'Resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ticket.status === 'Closed'
                          ? 'bg-slate-100 text-slate-600'
                          : ticket.status === 'Open'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
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

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {ticket.siteName} → {ticket.floorName} ({ticket.areaName})
                    </span>
                    <span>•</span>
                    <span>Reporter: {ticket.createdByName} ({ticket.createdByDept})</span>
                    {ticket.assignment && (
                      <>
                        <span>•</span>
                        <span className="text-blue-600 font-semibold">
                          Assigned: {ticket.assignment.assignedToName}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  {ticket.isBreached && ticket.status !== 'Closed' && ticket.status !== 'Resolved' && (
                    <button
                      onClick={(e) => handleEscalateBreach(ticket, e)}
                      className="px-2.5 py-1.5 text-xs font-bold text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-xl transition shadow-xs flex items-center gap-1"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" /> Escalate
                    </button>
                  )}

                  {!ticket.assignment && ticket.status !== 'Closed' ? (
                    <button
                      onClick={(e) => handleOpenDispatch(ticket, e)}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-xs flex items-center gap-1"
                    >
                      <UserCheck className="w-3.5 h-3.5" /> Fast Dispatch
                    </button>
                  ) : (
                    <button
                      onClick={(e) => handleOpenDispatch(ticket, e)}
                      className="px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                    >
                      Reassign
                    </button>
                  )}

                  <div className="p-2 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Fast Dispatch Modal */}
      {dispatchTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Dispatch Technician
              </h3>
              <button
                onClick={() => setDispatchTicket(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-1">
              <div className="font-mono font-bold text-blue-600">
                {dispatchTicket.ticketNumber} ({dispatchTicket.category})
              </div>
              <div className="font-bold text-slate-800 dark:text-slate-200">
                {dispatchTicket.title}
              </div>
              <div className="text-slate-500">
                {dispatchTicket.siteName} • {dispatchTicket.areaName}
              </div>
            </div>

            <form onSubmit={handleConfirmDispatch} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Select Specialist Technician *
                </label>
                <select
                  required
                  value={selectedTechId}
                  onChange={(e) => setSelectedTechId(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-slate-100"
                >
                  <option value="">Select Technician...</option>
                  {technicians.map((tech) => (
                    <option key={tech.id} value={tech.id}>
                      {tech.name} — {tech.department} ({tech.specialty?.join(', ') || 'General'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Dispatch Instructions (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Carry 15A socket tester and spare fuses..."
                  value={dispatchNote}
                  onChange={(e) => setDispatchNote(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDispatchTicket(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-xs"
                >
                  Confirm & Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
