/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  MapPin,
  Clock,
  User,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Star,
  Camera,
  History,
  Send,
  Building as BuildingIcon,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  Ticket,
  TicketStatus,
  UserProfile,
  TicketFeedback
} from '../types/facility';
import { SlaBadge } from './SlaBadge';
import {
  getUsers,
  getActiveUser,
  assignTicket,
  updateTicketStatus,
  reopenTicket,
  submitFeedbackAndClose
} from '../services/storageService';

interface TicketDetailModalProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

const STATUS_STEPS: TicketStatus[] = [
  'Open',
  'Supervisor Review',
  'Assigned',
  'In Progress',
  'Resolved',
  'Closed'
];

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  ticket,
  isOpen,
  onClose,
  onUpdate
}) => {
  if (!isOpen || !ticket) return null;

  const currentUser = getActiveUser();
  const allUsers = getUsers();
  const technicians = allUsers.filter((u) => u.role === 'technician');

  // Supervisor assignment state
  const [selectedTechId, setSelectedTechId] = useState(ticket.assignment?.assignedToId || technicians[0]?.id || '');
  const [assignNotes, setAssignNotes] = useState('');

  // Technician resolution state
  const [resNotes, setResNotes] = useState('');
  const [resPhotos, setResPhotos] = useState<string[]>([]);
  const [holdReason, setHoldReason] = useState('');
  const [showHoldInput, setShowHoldInput] = useState(false);
  const [showResolveForm, setShowResolveForm] = useState(false);

  // Employee feedback state
  const [rating, setRating] = useState(5);
  const [satisfaction, setSatisfaction] = useState<TicketFeedback['satisfaction']>('Satisfied');
  const [feedbackComments, setFeedbackComments] = useState('');
  const [reopenReason, setReopenReason] = useState('');
  const [showReopenInput, setShowReopenInput] = useState(false);

  // Selected image zoom
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const isSupervisorOrAdmin = currentUser.role === 'supervisor' || currentUser.role === 'admin';
  const isAssignedTechnician =
    currentUser.role === 'technician' && ticket.assignment?.assignedToId === currentUser.id;
  const isTicketCreator = currentUser.id === ticket.createdById || currentUser.role === 'employee';

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTechId) return;
    assignTicket(ticket.id, selectedTechId, assignNotes.trim());
    onUpdate?.();
  };

  const handleStatusChange = (newStatus: TicketStatus, comment?: string) => {
    updateTicketStatus(ticket.id, newStatus, comment);
    onUpdate?.();
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resNotes.trim()) return;
    updateTicketStatus(ticket.id, 'Resolved', 'Technician marked task resolved', resPhotos, resNotes.trim());
    setShowResolveForm(false);
    onUpdate?.();
  };

  const handleHoldSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!holdReason.trim()) return;
    updateTicketStatus(ticket.id, 'On Hold', `On Hold reason: ${holdReason.trim()}`);
    setShowHoldInput(false);
    onUpdate?.();
  };

  const handleReopenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reopenReason.trim()) return;
    reopenTicket(ticket.id, reopenReason.trim());
    setShowReopenInput(false);
    onUpdate?.();
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitFeedbackAndClose(ticket.id, {
      rating,
      satisfaction,
      comments: feedbackComments.trim() || 'No additional comments provided.',
      submittedAt: new Date().toISOString()
    });
    onUpdate?.();
  };

  const handleSampleResPhoto = () => {
    setResPhotos([
      'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=600&auto=format&fit=crop&q=80'
    ]);
  };

  const currentStepIdx = STATUS_STEPS.indexOf(ticket.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {ticket.ticketNumber}
            </span>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                ticket.priority === 'Critical'
                  ? 'bg-rose-100 text-rose-700 border border-rose-200'
                  : ticket.priority === 'High'
                  ? 'bg-amber-100 text-amber-700 border border-amber-200'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {ticket.priority} Priority
            </span>
            <SlaBadge ticket={ticket} />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Title & Category */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
              <span>{ticket.category}</span>
              <span>•</span>
              <span>Created {new Date(ticket.createdAt).toLocaleDateString()} at {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {ticket.title}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </p>
          </div>

          {/* Location Breadcrumbs */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200/70 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
            <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">{ticket.siteName}</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <span>{ticket.buildingName}</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <span>{ticket.floorName}</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <span className="font-semibold text-blue-600 dark:text-blue-400">{ticket.areaName}</span>
          </div>

          {/* Ticket Lifecycle Stepper */}
          <div>
            <div className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">
              Lifecycle Progress
            </div>
            <div className="flex items-center justify-between overflow-x-auto py-2">
              {STATUS_STEPS.map((step, idx) => {
                const isPassed = currentStepIdx >= idx;
                const isCurrent = ticket.status === step;
                return (
                  <div key={step} className="flex items-center gap-2 shrink-0">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                          isCurrent
                            ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/50'
                            : isPassed
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        {isPassed && !isCurrent ? '✓' : idx + 1}
                      </div>
                      <span className={`text-[10px] mt-1 font-medium ${isCurrent ? 'text-blue-600 font-bold' : 'text-slate-500'}`}>
                        {step}
                      </span>
                    </div>
                    {idx < STATUS_STEPS.length - 1 && (
                      <div className={`w-8 h-0.5 mx-1 mb-4 ${currentStepIdx > idx ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                    )}
                  </div>
                );
              })}
            </div>
            {ticket.status === 'On Hold' && (
              <div className="mt-2 text-xs font-medium text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Ticket is currently ON HOLD awaiting materials or vendor parts.</span>
              </div>
            )}
            {ticket.status === 'Reopened' && (
              <div className="mt-2 text-xs font-medium text-rose-700 bg-rose-50 p-2.5 rounded-lg border border-rose-200 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Ticket was REOPENED by employee. Requires supervisor review and re-dispatch.</span>
              </div>
            )}
          </div>

          {/* Attached Photographs */}
          {ticket.photoUrls.length > 0 && (
            <div>
              <div className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-blue-500" />
                Reported Photos ({ticket.photoUrls.length})
              </div>
              <div className="flex flex-wrap gap-3">
                {ticket.photoUrls.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt="Complaint photo"
                    onClick={() => setZoomedImage(img)}
                    className="w-24 h-24 object-cover rounded-xl border border-slate-200 dark:border-slate-700 hover:scale-105 cursor-pointer transition shadow-xs"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Resolution Evidence (If Resolved or Closed) */}
          {ticket.resolutionNotes && (
            <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Resolution Summary
              </div>
              <p className="text-sm text-emerald-900 dark:text-emerald-100">
                {ticket.resolutionNotes}
              </p>
              {ticket.resolutionPhotoUrls && ticket.resolutionPhotoUrls.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {ticket.resolutionPhotoUrls.map((p, i) => (
                    <img
                      key={i}
                      src={p}
                      alt="Work completed evidence"
                      onClick={() => setZoomedImage(p)}
                      className="w-20 h-20 object-cover rounded-lg border border-emerald-300 cursor-pointer hover:scale-105 transition"
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Feedback & Satisfaction Section (If Closed) */}
          {ticket.feedback && (
            <div className="p-4 bg-amber-50/70 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                  Employee Rating & Feedback
                </span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= ticket.feedback!.rating
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300 italic">
                "{ticket.feedback.comments}"
              </p>
              <div className="text-[11px] text-slate-500">
                Satisfaction: <strong>{ticket.feedback.satisfaction}</strong> • Submitted {new Date(ticket.feedback.submittedAt).toLocaleDateString()}
              </div>
            </div>
          )}

          {/* Role-Specific Action Controls */}
          {/* 1. Supervisor Assignment Panel */}
          {isSupervisorOrAdmin && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-blue-600" />
                  Technician / Vendor Assignment
                </div>
                {ticket.assignment && (
                  <span className="text-xs text-slate-500">
                    Assigned to: <strong>{ticket.assignment.assignedToName}</strong>
                  </span>
                )}
              </div>

              <form onSubmit={handleAssignSubmit} className="flex flex-col sm:flex-row gap-2">
                <select
                  value={selectedTechId}
                  onChange={(e) => setSelectedTechId(e.target.value)}
                  className="flex-1 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-slate-100"
                >
                  <option value="">Select Technician...</option>
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.department} - {t.specialty?.join(', ') || 'General'})
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Optional instructions / tools required..."
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  className="flex-1 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-slate-100"
                />

                <button
                  type="submit"
                  className="px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-xs whitespace-nowrap"
                >
                  {ticket.assignment ? 'Reassign' : 'Assign & Dispatch'}
                </button>
              </form>
            </div>
          )}

          {/* 2. Technician Work Actions */}
          {(isAssignedTechnician || isSupervisorOrAdmin) && ticket.status !== 'Closed' && ticket.status !== 'Resolved' && (
            <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-900 space-y-3">
              <div className="text-xs font-bold uppercase text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-blue-600" />
                Technician Action Queue
              </div>

              <div className="flex flex-wrap gap-2">
                {ticket.status !== 'In Progress' && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange('In Progress', 'Technician arrived at site and commenced inspection.')}
                    className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-xs"
                  >
                    Start Work (Mark In-Progress)
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowHoldInput(!showHoldInput)}
                  className="px-3.5 py-2 text-xs font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-xl transition"
                >
                  Put On Hold
                </button>

                <button
                  type="button"
                  onClick={() => setShowResolveForm(!showResolveForm)}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-xs"
                >
                  Mark as Resolved ✓
                </button>
              </div>

              {/* On Hold Form */}
              {showHoldInput && (
                <form onSubmit={handleHoldSubmit} className="pt-2 flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Enter reason (e.g. waiting for replacement ball valve)..."
                    value={holdReason}
                    onChange={(e) => setHoldReason(e.target.value)}
                    className="flex-1 text-xs rounded-xl border border-amber-300 bg-white dark:bg-slate-800 p-2 text-slate-900 dark:text-slate-100"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl"
                  >
                    Confirm Hold
                  </button>
                </form>
              )}

              {/* Mark Resolved Form */}
              {showResolveForm && (
                <form onSubmit={handleResolveSubmit} className="pt-3 space-y-3 border-t border-blue-200 dark:border-blue-800">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Resolution Notes / Work Performed *
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Describe what was fixed, parts replaced, or tests executed..."
                      value={resNotes}
                      onChange={(e) => setResNotes(e.target.value)}
                      className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleSampleResPhoto}
                      className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
                    >
                      <Camera className="w-3.5 h-3.5" /> Attach Sample Work Completion Photo
                    </button>

                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                    >
                      Submit Resolution
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* 3. Employee Confirmation & Feedback (When Ticket is Resolved) */}
          {ticket.status === 'Resolved' && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-300 dark:border-emerald-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                    Technician has completed this task!
                  </h3>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                    Please inspect the resolution and rate your experience to officially close the ticket.
                  </p>
                </div>
              </div>

              <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                {/* 1-5 Stars */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Rate Service Quality (1 - 5 Stars)
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-110 transition"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= rating
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-slate-300 dark:text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-amber-600 ml-2">
                      {rating === 5 ? 'Excellent' : rating === 4 ? 'Good' : rating === 3 ? 'Average' : 'Needs Improvement'}
                    </span>
                  </div>
                </div>

                {/* Satisfaction */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Satisfaction Level
                  </label>
                  <div className="flex gap-2">
                    {(['Satisfied', 'Neutral', 'Dissatisfied'] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setSatisfaction(opt)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                          satisfaction === opt
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comments */}
                <div>
                  <textarea
                    rows={2}
                    placeholder="Provide constructive feedback or compliments for the technician..."
                    value={feedbackComments}
                    onChange={(e) => setFeedbackComments(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setShowReopenInput(!showReopenInput)}
                    className="text-xs text-rose-600 dark:text-rose-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Issue not resolved? Reopen
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                  >
                    Confirm & Close Ticket
                  </button>
                </div>
              </form>

              {/* Reopen form */}
              {showReopenInput && (
                <form onSubmit={handleReopenSubmit} className="pt-2 border-t border-emerald-200 dark:border-emerald-800 flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="State reason why problem remains unresolved..."
                    value={reopenReason}
                    onChange={(e) => setReopenReason(e.target.value)}
                    className="flex-1 text-xs rounded-xl border border-rose-300 bg-white dark:bg-slate-800 p-2 text-slate-900 dark:text-slate-100"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl"
                  >
                    Confirm Reopen
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Activity & Audit Trail */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-blue-500" />
              Activity & Audit Trail ({ticket.activityLogs.length})
            </div>
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 overflow-hidden">
              {ticket.activityLogs.map((log) => (
                <div key={log.id} className="p-3 text-xs flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {log.action}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(log.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                      by <strong className="text-slate-700 dark:text-slate-300">{log.performedByName}</strong>
                    </div>
                    {log.comment && (
                      <p className="mt-1 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700/60 text-[11px]">
                        {log.comment}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            Reported by: <strong>{ticket.createdByName}</strong> ({ticket.createdByDept})
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 rounded-xl transition"
          >
            Close
          </button>
        </div>

        {/* Zoomed Photo Modal */}
        {zoomedImage && (
          <div
            onClick={() => setZoomedImage(null)}
            className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4 cursor-zoom-out"
          >
            <img src={zoomedImage} alt="Zoomed preview" className="max-w-full max-h-[85vh] rounded-xl shadow-2xl" />
          </div>
        )}
      </div>
    </div>
  );
};
