/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { EmployeeDashboard } from './views/EmployeeDashboard';
import { SupervisorDashboard } from './views/SupervisorDashboard';
import { TechnicianDashboard } from './views/TechnicianDashboard';
import { ManagementAnalytics } from './views/ManagementAnalytics';
import { AdminSettings } from './views/AdminSettings';
import { RaiseComplaintModal } from './components/RaiseComplaintModal';
import { TicketDetailModal } from './components/TicketDetailModal';
import { QrScannerModal } from './components/QrScannerModal';
import { SupabaseModal } from './components/SupabaseModal';
import { Ticket, Area } from './types/facility';
import {
  getActiveUser,
  getTicketById,
  subscribeToStore
} from './services/storageService';

export default function App() {
  const [currentUser, setCurrentUser] = useState(getActiveUser());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics' | 'admin'>('dashboard');

  // Modals
  const [isRaiseModalOpen, setIsRaiseModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Pre-selected area from QR code scan
  const [qrSelectedArea, setQrSelectedArea] = useState<Area | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    const unsubscribe = subscribeToStore(() => {
      setCurrentUser(getActiveUser());
      if (selectedTicket) {
        const fresh = getTicketById(selectedTicket.id);
        if (fresh) setSelectedTicket(fresh);
      }
    });
    return unsubscribe;
  }, [selectedTicket]);

  const handleSelectTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsDetailModalOpen(true);
  };

  const handleSelectTicketFromNotification = (ticketId: string) => {
    const t = getTicketById(ticketId);
    if (t) {
      setSelectedTicket(t);
      setIsDetailModalOpen(true);
    }
  };

  const handleAreaScanned = (area: Area) => {
    setQrSelectedArea(area);
    setIsRaiseModalOpen(true);
    showToast(`QR Scanned: Location pre-filled for ${area.name}`);
  };

  const handleTicketCreated = (ticketId: string) => {
    const t = getTicketById(ticketId);
    if (t) {
      showToast(`Complaint ${t.ticketNumber} registered successfully! Target SLA countdown initiated.`);
      setSelectedTicket(t);
      setIsDetailModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-60 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top-4 duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenRaiseModal={() => {
          setQrSelectedArea(null);
          setIsRaiseModalOpen(true);
        }}
        onOpenQrModal={() => setIsQrModalOpen(true)}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onSelectTicketFromNotification={handleSelectTicketFromNotification}
      />

      {/* Main Body Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'analytics' && <ManagementAnalytics />}

        {activeTab === 'admin' && (
          <AdminSettings
            onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
            onOpenQrModal={() => setIsQrModalOpen(true)}
          />
        )}

        {activeTab === 'dashboard' && (
          <>
            {currentUser.role === 'employee' && (
              <EmployeeDashboard
                onSelectTicket={handleSelectTicket}
                onOpenRaiseModal={() => {
                  setQrSelectedArea(null);
                  setIsRaiseModalOpen(true);
                }}
              />
            )}

            {currentUser.role === 'supervisor' && (
              <SupervisorDashboard
                onSelectTicket={handleSelectTicket}
                onOpenRaiseModal={() => {
                  setQrSelectedArea(null);
                  setIsRaiseModalOpen(true);
                }}
              />
            )}

            {currentUser.role === 'technician' && (
              <TechnicianDashboard onSelectTicket={handleSelectTicket} />
            )}

            {currentUser.role === 'admin' && (
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300 flex items-center justify-between">
                  <span>
                    Logged in as <strong>Administrator ({currentUser.name})</strong>. Viewing complete operational queue with supervisor & dispatch authority.
                  </span>
                  <button
                    onClick={() => setActiveTab('admin')}
                    className="font-bold underline hover:text-blue-900"
                  >
                    Go to Admin Settings →
                  </button>
                </div>
                <SupervisorDashboard
                  onSelectTicket={handleSelectTicket}
                  onOpenRaiseModal={() => {
                    setQrSelectedArea(null);
                    setIsRaiseModalOpen(true);
                  }}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Raise Complaint Modal */}
      <RaiseComplaintModal
        isOpen={isRaiseModalOpen}
        onClose={() => {
          setIsRaiseModalOpen(false);
          setQrSelectedArea(null);
        }}
        preselectedArea={qrSelectedArea}
        onTicketCreated={handleTicketCreated}
      />

      {/* Ticket Detail & Lifecycle Modal */}
      <TicketDetailModal
        ticket={selectedTicket}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedTicket(null);
        }}
        onUpdate={() => {
          if (selectedTicket) {
            setSelectedTicket(getTicketById(selectedTicket.id) || null);
          }
        }}
      />

      {/* QR Code Scanner & Card Generator */}
      <QrScannerModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        onSelectAreaForComplaint={handleAreaScanned}
      />

      {/* Supabase Connection & DDL Script Modal */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onConfigUpdated={() => {
          showToast('Supabase configuration updated successfully!');
        }}
      />

      {/* Enterprise Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-300">FacilityFlow OS</span>
            <span>•</span>
            <span>Multi-Site Facility Helpdesk & SLA Command System</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Locations: Gurgaon • Bangalore • Mumbai</span>
            <span>•</span>
            <button
              onClick={() => setIsSupabaseModalOpen(true)}
              className="text-emerald-600 hover:underline font-semibold"
            >
              Supabase PostgreSQL Link
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
