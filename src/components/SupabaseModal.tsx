/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Server,
  ShieldCheck,
  UploadCloud
} from 'lucide-react';
import {
  getStoredSupabaseConfig,
  saveStoredSupabaseConfig,
  testSupabaseConnection,
  generateSupabaseSqlSchema,
  resetSupabaseClient,
  getSupabaseClient
} from '../services/supabaseService';
import { getTickets } from '../services/storageService';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated?: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  onConfigUpdated
}) => {
  if (!isOpen) return null;

  const currentConfig = getStoredSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(currentConfig.supabaseUrl);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(currentConfig.supabaseAnonKey);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    tableFound?: boolean;
  } | null>(null);

  const [copiedSql, setCopiedSql] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const sqlScript = generateSupabaseSqlSchema();

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrl.trim() || !supabaseAnonKey.trim()) {
      setTestResult({
        success: false,
        message: 'Please enter both Supabase Project URL and Anon Public Key.'
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const result = await testSupabaseConnection(supabaseUrl.trim(), supabaseAnonKey.trim());
    setIsTesting(false);
    setTestResult(result);

    if (result.success) {
      saveStoredSupabaseConfig({
        supabaseUrl: supabaseUrl.trim(),
        supabaseAnonKey: supabaseAnonKey.trim(),
        isConnected: true,
        lastSync: new Date().toISOString()
      });
      resetSupabaseClient();
      onConfigUpdated?.();
    }
  };

  const handleDisconnect = () => {
    saveStoredSupabaseConfig({
      supabaseUrl: '',
      supabaseAnonKey: '',
      isConnected: false
    });
    setSupabaseUrl('');
    setSupabaseAnonKey('');
    setTestResult(null);
    resetSupabaseClient();
    onConfigUpdated?.();
  };

  const handleSyncAllToSupabase = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setSyncStatus('Supabase is not connected. Save valid credentials first.');
      return;
    }

    setIsSyncing(true);
    setSyncStatus('Uploading all local tickets and activity logs to Supabase...');

    try {
      const tickets = getTickets();
      let successCount = 0;

      for (const t of tickets) {
        const payload = {
          id: t.id,
          ticket_number: t.ticketNumber,
          title: t.title,
          description: t.description,
          category: t.category,
          priority: t.priority,
          status: t.status,
          site_id: t.siteId,
          site_name: t.siteName,
          building_id: t.buildingId,
          building_name: t.buildingName,
          floor_id: t.floorId,
          floor_name: t.floorName,
          area_id: t.areaId,
          area_name: t.areaName,
          photo_urls: t.photoUrls,
          resolution_photo_urls: t.resolutionPhotoUrls || [],
          resolution_notes: t.resolutionNotes || null,
          created_by_id: t.createdById,
          created_by_name: t.createdByName,
          created_by_email: t.createdByEmail,
          created_by_dept: t.createdByDept,
          created_at: t.createdAt,
          sla_hours_target: t.slaHoursTarget,
          sla_deadline: t.slaDeadline,
          resolved_at: t.resolvedAt || null,
          closed_at: t.closedAt || null,
          is_breached: t.isBreached,
          assignment: t.assignment || null,
          feedback: t.feedback || null,
          activity_logs: t.activityLogs || []
        };

        const { error } = await supabase.from('facility_tickets').upsert(payload, { onConflict: 'id' });
        if (!error) successCount++;
      }

      setIsSyncing(false);
      setSyncStatus(`Successfully synchronized ${successCount} tickets to Supabase table "facility_tickets"!`);
      saveStoredSupabaseConfig({
        ...getStoredSupabaseConfig(),
        lastSync: new Date().toISOString()
      });
      onConfigUpdated?.();
    } catch (e: any) {
      setIsSyncing(false);
      setSyncStatus(`Sync error: ${e.message || 'Make sure facility_tickets table exists'}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Database className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">Supabase PostgreSQL Connection</h2>
                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    currentConfig.isConnected
                      ? 'bg-emerald-400 text-emerald-950'
                      : 'bg-white/20 text-white'
                  }`}
                >
                  {currentConfig.isConnected ? 'Connected' : 'Offline / Local'}
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">
                Connect external Supabase project for PostgreSQL cloud persistence & real-time sync
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Quick Guide */}
          <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-2">
            <h3 className="text-xs font-bold text-emerald-900 dark:text-emerald-200 uppercase tracking-wider flex items-center gap-1.5">
              <Server className="w-4 h-4 text-emerald-600" />
              How to Connect with Supabase in 3 Steps:
            </h3>
            <ol className="text-xs text-emerald-800 dark:text-emerald-300 space-y-1 list-decimal list-inside">
              <li>
                In your <strong>Supabase Dashboard</strong>, open <strong>SQL Editor</strong> and paste the schema script provided below.
              </li>
              <li>
                Copy your <strong>Project URL</strong> and <strong>anon / public API key</strong> from <em>Project Settings → API</em>.
              </li>
              <li>Paste them below and click <strong>"Test & Connect to Supabase"</strong>.</li>
            </ol>
          </div>

          {/* Connection Form */}
          <form onSubmit={handleTestAndSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Supabase Project URL *
              </label>
              <input
                type="url"
                required
                placeholder="https://xyzabcdefghijklm.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="w-full text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Supabase Anon / Public API Key *
              </label>
              <input
                type="password"
                required
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                className="w-full text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {testResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                    : 'bg-rose-50 border-rose-300 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <div className="font-bold">
                    {testResult.success ? 'Connection Validated' : 'Connection Failed'}
                  </div>
                  <div>{testResult.message}</div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              {currentConfig.isConnected ? (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition"
                >
                  Disconnect Supabase
                </button>
              ) : (
                <div className="text-[11px] text-slate-400">
                  Runs with instant local storage fallback when offline
                </div>
              )}

              <div className="flex items-center gap-2">
                {currentConfig.isConnected && (
                  <button
                    type="button"
                    disabled={isSyncing}
                    onClick={handleSyncAllToSupabase}
                    className="px-3.5 py-2 text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition flex items-center gap-1.5 shadow-xs"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    {isSyncing ? 'Syncing...' : 'Sync Local Tickets to Supabase'}
                  </button>
                )}

                <button
                  type="submit"
                  disabled={isTesting}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 rounded-xl transition shadow-md flex items-center gap-1.5"
                >
                  {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  {isTesting ? 'Verifying...' : 'Test & Connect to Supabase'}
                </button>
              </div>
            </div>

            {syncStatus && (
              <div className="text-xs p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300">
                {syncStatus}
              </div>
            )}
          </form>

          {/* SQL Schema Generator */}
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Supabase PostgreSQL SQL Schema & DDL
                </h4>
                <p className="text-[11px] text-slate-400">
                  Ready-to-run DDL creating tables, RLS policies, indexes, and constraints
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopySql}
                className="px-3 py-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl transition flex items-center gap-1.5 shadow-xs"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSql ? 'Copied to Clipboard!' : 'Copy SQL Schema'}
              </button>
            </div>

            <div className="relative">
              <pre className="p-3 text-[11px] font-mono bg-slate-900 text-emerald-300 rounded-xl max-h-48 overflow-y-auto leading-relaxed border border-slate-800">
                {sqlScript}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
