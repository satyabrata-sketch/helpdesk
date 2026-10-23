/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Camera,
  Play,
  Pause,
  ArrowRight,
  ShieldAlert,
  Send
} from 'lucide-react';
import { Ticket } from '../types/facility';
import { SlaBadge } from '../components/SlaBadge';
import {
  getTickets,
  getActiveUser,
  updateTicketStatus
} from '../services/storageService';

interface TechnicianDashboardProps {
  onSelectTicket: (ticket: Ticket) => void;
}

export const TechnicianDashboard: React.FC<TechnicianDashboardProps> = ({
  onSelectTicket
}) => {
  const currentUser = getActiveUser();
  const allTickets = getTickets();

  // Tickets assigned to this technician (or all unassigned/assigned if admin/supervisor testing)
  const myAssignedTickets = allTickets.filter(
    (t) =>
      t.assignment?.assignedToId === currentUser.id ||
      (currentUser.role === 'admin' && t.assignment)
  );

  const [activeTab, setActiveTab] = useState<'pending' | 'inprogress' | 'completed'>('pending');

  const pendingTickets = myAssignedTickets.filter((t) => t.status === 'Assigned' || t.status === 'On Hold' || t.status === 'Reopened');
  const inProgressTickets = myAssignedTickets.filter((t) => t.status === 'In Progress');
  const completedTickets = myAssignedTickets.filter((t) => t.status === 'Resolved' || t.status === 'Closed');

  const currentList =
    activeTab === 'pending'
      ? pendingTickets
      : activeTab === 'inprogress'
      ? inProgressTickets
      : completedTickets;

  const handleQuickStart = (ticketId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    updateTicketStatus(ticketId, 'In Progress', 'Technician arrived on-site and initiated repair.');
  };

  return (
    <div className="space-y-6">
      {/* Technician Profile Card */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 text-white rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-14 h-14 rounded-2xl object-cover ring-2 ring-blue-400/40 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{currentUser.name}</h1>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Field Technician
              </span>
            </div>
            <p className="text-xs text-blue-200 mt-0.5">
              {currentUser.department} • Specialties: {currentUser.specialty?.join(', ') || 'General Facility'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {currentUser.phone} • Base Site: Gurgaon Cyber City
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="px-4 py-2 bg-white/10 rounded-xl text-center backdrop-blur-xs">
            <div className="text-xl font-bold text-white">{inProgressTickets.length}</div>
            <div className="text-[10px] text-blue-200">In Progress</div>
          </div>
          <div className="px-4 py-2 bg-white/10 rounded-xl text-center backdrop-blur-xs">
            <div className="text-xl font-bold text-amber-300">{pendingTickets.length}</div>
            <div className="text-[10px] text-blue-200">Pending Start</div>
          </div>
          <div className="px-4 py-2 bg-white/10 rounded-xl text-center backdrop-blur-xs">
            <div className="text-xl font-bold text-emerald-400">{completedTickets.length}</div>
            <div className="text-[10px] text-blue-200">Completed</div>
          </div>
        </div>
      </div>

      {/* Work Queue Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-xs">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
            activeTab === 'pending'
              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>New & Pending Dispatch ({pendingTickets.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('inprogress')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
            activeTab === 'inprogress'
              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Active In-Progress ({inProgressTickets.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
            activeTab === 'completed'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Completed / Resolved ({completedTickets.length})</span>
        </button>
      </div>

      {/* Task Queue Cards */}
      <div className="space-y-3">
        {currentList.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Queue is Clear!
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No tasks currently in this state. Check other tabs or await new supervisor assignments.
            </p>
          </div>
        ) : (
          currentList.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => onSelectTicket(ticket)}
              className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 cursor-pointer transition shadow-xs space-y-3 group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    {ticket.ticketNumber}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      ticket.priority === 'Critical'
                        ? 'bg-rose-100 text-rose-700 font-bold'
                        : ticket.priority === 'High'
                        ? 'bg-amber-100 text-amber-700 font-bold'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {ticket.priority} Priority
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    {ticket.category}
                  </span>
                </div>
                <SlaBadge ticket={ticket} />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition">
                  {ticket.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">
                  {ticket.description}
                </p>
              </div>

              {/* Location & Instructions */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>
                    {ticket.siteName} • {ticket.buildingName} • {ticket.floorName} ({ticket.areaName})
                  </span>
                </div>

                {ticket.assignment?.notes && (
                  <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium italic">
                    Supervisor Note: "{ticket.assignment.notes}"
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-1">
                <div className="text-[11px] text-slate-400">
                  Assigned by: {ticket.assignment?.assignedByName || 'Supervisor'}
                </div>

                <div className="flex items-center gap-2">
                  {ticket.status === 'Assigned' && (
                    <button
                      type="button"
                      onClick={(e) => handleQuickStart(ticket.id, e)}
                      className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-xs flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Start Work
                    </button>
                  )}

                  {ticket.status === 'In Progress' && (
                    <button
                      type="button"
                      onClick={() => onSelectTicket(ticket)}
                      className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-xs flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Complete & Upload Evidence
                    </button>
                  )}

                  <div className="p-1.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
