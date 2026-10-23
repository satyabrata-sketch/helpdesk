/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, QrCode, MapPin, Sparkles, Printer, Check, Copy } from 'lucide-react';
import { Area } from '../types/facility';
import { getAllAreas, getFloors, getBuildings, getSites } from '../services/storageService';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAreaForComplaint: (area: Area) => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  onSelectAreaForComplaint
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'scan' | 'generate'>('scan');
  const areas = getAllAreas();
  const floors = getFloors();
  const buildings = getBuildings();
  const sites = getSites();

  const [selectedGenerateAreaId, setSelectedGenerateAreaId] = useState(areas[0]?.id || '');
  const [copiedCode, setCopiedCode] = useState(false);

  const selectedArea = areas.find((a) => a.id === selectedGenerateAreaId) || areas[0];
  const selectedFloor = floors.find((f) => f.id === selectedArea?.floorId);
  const selectedBuilding = buildings.find((b) => b.id === selectedFloor?.buildingId);
  const selectedSite = sites.find((s) => s.id === selectedBuilding?.siteId);

  const handleSimulateScan = (area: Area) => {
    onSelectAreaForComplaint(area);
    onClose();
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-400/30">
              <QrCode className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-bold">QR Quick Location Assistant</h2>
              <p className="text-xs text-slate-300">Scan on-site tags or generate printable room cards</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 pt-3 bg-slate-50 dark:bg-slate-800/40">
          <button
            onClick={() => setActiveTab('scan')}
            className={`pb-3 text-xs font-bold border-b-2 transition mr-6 flex items-center gap-1.5 ${
              activeTab === 'scan'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Scan / Select Area QR
          </button>
          <button
            onClick={() => setActiveTab('generate')}
            className={`pb-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'generate'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Printer className="w-3.5 h-3.5" /> Printable Room Tag Generator
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'scan' ? (
            <div className="space-y-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900">
                <div className="w-16 h-16 mx-auto bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-md border border-slate-200 mb-2">
                  <QrCode className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-pulse" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Simulate Camera QR Code Scan
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Click any on-site area below to simulate scanning a physical QR code on a meeting room table or washroom door:
                </p>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {areas.map((area) => {
                  const flr = floors.find((f) => f.id === area.floorId);
                  const bld = buildings.find((b) => b.id === flr?.buildingId);
                  const sit = sites.find((s) => s.id === bld?.siteId);

                  return (
                    <div
                      key={area.id}
                      onClick={() => handleSimulateScan(area)}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 cursor-pointer transition flex items-center justify-between group"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600">
                            {area.name}
                          </span>
                          <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            {area.qrCode}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {sit?.name} • {bld?.name} • {flr?.name}
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-blue-600 bg-blue-100 dark:bg-blue-900/60 px-2.5 py-1 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition">
                        Scan & Raise
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Select Room / Zone for QR Tag
                </label>
                <select
                  value={selectedGenerateAreaId}
                  onChange={(e) => setSelectedGenerateAreaId(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-slate-100"
                >
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.type})
                    </option>
                  ))}
                </select>
              </div>

              {selectedArea && (
                <div className="p-6 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-center space-y-3">
                  <div className="inline-block p-4 bg-white rounded-2xl shadow-md border border-slate-200">
                    {/* Visual QR Code Representation */}
                    <div className="w-32 h-32 bg-slate-900 p-2 rounded-xl flex flex-col justify-between items-center text-white text-[9px] font-mono select-none">
                      <div className="w-full flex justify-between">
                        <div className="w-7 h-7 bg-white rounded-xs p-1"><div className="w-full h-full bg-slate-900" /></div>
                        <div className="w-7 h-7 bg-white rounded-xs p-1"><div className="w-full h-full bg-slate-900" /></div>
                      </div>
                      <div className="text-center font-bold tracking-widest text-[8px] text-blue-300">
                        SCAN TO REPORT
                      </div>
                      <div className="w-full flex justify-between items-end">
                        <div className="w-7 h-7 bg-white rounded-xs p-1"><div className="w-full h-full bg-slate-900" /></div>
                        <div className="text-[7px] text-slate-300 font-mono">{selectedArea.qrCode.substring(0, 10)}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {selectedArea.name}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {selectedSite?.name} • {selectedBuilding?.name} • {selectedFloor?.name}
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleCopyCode(selectedArea.qrCode)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedCode ? 'Copied' : 'Copy Code'}
                    </button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 shadow-xs"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print Tag
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
