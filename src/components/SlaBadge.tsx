/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Ticket } from '../types/facility';

interface SlaBadgeProps {
  ticket: Ticket;
  compact?: boolean;
}

export const SlaBadge: React.FC<SlaBadgeProps> = ({ ticket, compact = false }) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    // Tick every 15 seconds to update countdown
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const isClosedOrResolved = ticket.status === 'Resolved' || ticket.status === 'Closed';
  const deadlineTime = new Date(ticket.slaDeadline).getTime();
  const createdTime = new Date(ticket.createdAt).getTime();
  const totalDuration = deadlineTime - createdTime;

  if (isClosedOrResolved) {
    const endTimestamp = ticket.resolvedAt ? new Date(ticket.resolvedAt).getTime() : (ticket.closedAt ? new Date(ticket.closedAt).getTime() : deadlineTime);
    const wasBreached = endTimestamp > deadlineTime;

    if (wasBreached) {
      const overMs = endTimestamp - deadlineTime;
      const overHours = (overMs / (3600 * 1000)).toFixed(1);
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800 ${
            compact ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
          SLA Breached (+{overHours}h)
        </span>
      );
    }

    const durationHours = ((endTimestamp - createdTime) / (3600 * 1000)).toFixed(1);
    return (
      <span
        className={`inline-flex items-center gap-1 font-medium rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 ${
          compact ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
        }`}
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
        SLA Met ({durationHours}h)
      </span>
    );
  }

  // Active ticket countdown
  const diffMs = deadlineTime - now;
  const isOverdue = diffMs < 0;
  const absDiff = Math.abs(diffMs);
  const diffHours = Math.floor(absDiff / (3600 * 1000));
  const diffMinutes = Math.floor((absDiff % (3600 * 1000)) / (60 * 1000));

  if (isOverdue) {
    return (
      <span
        className={`inline-flex items-center gap-1 font-semibold rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-400 animate-pulse ${
          compact ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
        }`}
      >
        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
        BREACHED (-{diffHours}h {diffMinutes}m)
      </span>
    );
  }

  const fractionLeft = diffMs / totalDuration;
  const isNearBreach = fractionLeft <= 0.25 || diffHours < 1;

  if (isNearBreach) {
    return (
      <span
        className={`inline-flex items-center gap-1 font-medium rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 ${
          compact ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
        }`}
      >
        <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
        Warning ({diffHours}h {diffMinutes}m left)
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border border-sky-200 dark:border-sky-800 ${
        compact ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <Clock className="w-3.5 h-3.5 text-sky-500" />
      {diffHours}h {diffMinutes}m left (SLA: {ticket.slaHoursTarget}h)
    </span>
  );
};
