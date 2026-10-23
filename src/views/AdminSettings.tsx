/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  MapPin,
  Building,
  Layers,
  Plus,
  Clock,
  Database,
  Users,
  RotateCcw,
  Check,
  QrCode,
  Save,
  Server
} from 'lucide-react';
import { TicketCategory, Site, Building as BuildingType, Floor, Area } from '../types/facility';
import {
  getSites,
  getBuildings,
  getFloors,
  getAreas,
  getSLAConfigs,
  getUsers,
  addSite,
  addBuilding,
  addFloor,
  addArea,
  updateSLAConfig,
  resetToSeedData
} from '../services/storageService';
import { getStoredSupabaseConfig } from '../services/supabaseService';

interface AdminSettingsProps {
  onOpenSupabaseModal: () => void;
  onOpenQrModal: () => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  onOpenSupabaseModal,
  onOpenQrModal
}) => {
  const sites = getSites();
  const buildings = getBuildings();
  const floors = getFloors();
  const areas = getAreas();
  const slaConfigs = getSLAConfigs();
  const users = getUsers();
  const supabaseConfig = getStoredSupabaseConfig();

  const [activeTab, setActiveTab] = useState<'locations' | 'sla' | 'users' | 'supabase'>('locations');

  // New site modal / form
  const [showAddSite, setShowAddSite] = useState(false);
  const [siteName, setSiteName] = useState('');
  const [siteCode, setSiteCode] = useState('');
  const [siteCity, setSiteCity] = useState('');
  const [siteAddress, setSiteAddress] = useState('');

  // New building form
  const [showAddBld, setShowAddBld] = useState(false);
  const [bldSiteId, setBldSiteId] = useState(sites[0]?.id || '');
  const [bldName, setBldName] = useState('');
  const [bldCode, setBldCode] = useState('');

  // New area form
  const [showAddArea, setShowAddArea] = useState(false);
  const [areaFloorId, setAreaFloorId] = useState(floors[0]?.id || '');
  const [areaName, setAreaName] = useState('');
  const [areaType, setAreaType] = useState<Area['type']>('Meeting Room');

  // SLA editing state
  const [editingSla, setEditingSla] = useState<Record<string, number>>({});
  const [slaSaved, setSlaSaved] = useState(false);

  const handleAddSiteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteName || !siteCode) return;
    addSite(siteName, siteCode, siteCity, siteAddress);
    setShowAddSite(false);
    setSiteName('');
    setSiteCode('');
  };

  const handleAddBldSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bldName || !bldCode) return;
    addBuilding(bldSiteId, bldName, bldCode);
    setShowAddBld(false);
    setBldName('');
    setBldCode('');
  };

  const handleAddAreaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!areaName) return;
    addArea(areaFloorId, areaName, areaType);
    setShowAddArea(false);
    setAreaName('');
  };

  const handleSaveSla = () => {
    Object.entries(editingSla).forEach(([cat, hours]) => {
      updateSLAConfig(cat as TicketCategory, hours);
    });
    setSlaSaved(true);
    setTimeout(() => setSlaSaved(false), 2000);
  };

  const handleResetData = () => {
    if (confirm('Reset all sites, tickets, and configurations back to enterprise demo seed data?')) {
      resetToSeedData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-900 text-white rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Facility System Administration
            </span>
            <span className="text-xs text-slate-400">Global Configuration Console</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight mt-1">
            Locations, SLA Policies & Supabase Integration
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure multi-tier location hierarchies, fine-tune resolution SLA target hours, and manage Supabase database links.
          </p>
        </div>

        <button
          onClick={handleResetData}
          className="px-3.5 py-2 text-xs font-semibold text-rose-300 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 rounded-xl transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset Demo Seed Data
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-xs">
        <button
          onClick={() => setActiveTab('locations')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
            activeTab === 'locations'
              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Location Hierarchy ({sites.length} Sites, {areas.length} Areas)</span>
        </button>

        <button
          onClick={() => setActiveTab('sla')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
            activeTab === 'sla'
              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>SLA Framework (10 Categories)</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
            activeTab === 'users'
              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Users & Technicians ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('supabase')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
            activeTab === 'supabase'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Database className="w-4 h-4 text-emerald-600" />
          <span>Supabase Sync</span>
        </button>
      </div>

      {/* Tab 1: Location Hierarchy */}
      {activeTab === 'locations' && (
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Campus Sites & Buildings Tree
                </h3>
                <p className="text-xs text-slate-400">
                  Site → Building → Floor → Area / Zone
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddSite(true)}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Campus Site
                </button>
                <button
                  onClick={() => setShowAddBld(true)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Building
                </button>
                <button
                  onClick={() => setShowAddArea(true)}
                  className="px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Area / Zone
                </button>
              </div>
            </div>

            {/* Hierarchical Visualizer */}
            <div className="space-y-4 pt-2">
              {sites.map((site) => {
                const siteBuildings = buildings.filter((b) => b.siteId === site.id);
                return (
                  <div key={site.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold">
                          {site.code}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{site.name}</h4>
                          <p className="text-[11px] text-slate-500">{site.address}</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-slate-400">
                        {siteBuildings.length} Buildings
                      </span>
                    </div>

                    {/* Buildings under site */}
                    <div className="pl-6 space-y-2 border-l-2 border-blue-200 dark:border-blue-800">
                      {siteBuildings.map((bld) => {
                        const bldFloors = floors.filter((f) => f.buildingId === bld.id);
                        return (
                          <div key={bld.id} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                <Building className="w-3.5 h-3.5 text-slate-400" />
                                {bld.name} ({bld.code})
                              </span>
                              <span className="text-[11px] text-slate-400">
                                {bldFloors.length} Floors
                              </span>
                            </div>

                            {/* Floors & Areas */}
                            <div className="flex flex-wrap gap-2 pt-1">
                              {bldFloors.map((flr) => {
                                const flrAreas = areas.filter((a) => a.floorId === flr.id);
                                return (
                                  <div key={flr.id} className="text-[11px] p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <div className="font-bold text-blue-600">{flr.name}</div>
                                    <div className="text-slate-500 mt-0.5">
                                      {flrAreas.map((a) => a.name).join(', ') || 'No zones yet'}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: SLA Policy Configuration */}
      {activeTab === 'sla' && (
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Service Level Agreement (SLA) Resolution Targets
              </h3>
              <p className="text-xs text-slate-400">
                Adjust the base target resolution hours for each of the 10 standard facility complaint categories
              </p>
            </div>

            <button
              onClick={handleSaveSla}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-xs flex items-center gap-1.5"
            >
              {slaSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {slaSaved ? 'SLA Policies Saved!' : 'Save SLA Changes'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {slaConfigs.map((cfg) => {
              const currentVal = editingSla[cfg.category] !== undefined ? editingSla[cfg.category] : cfg.targetHours;
              return (
                <div key={cfg.category} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {cfg.category}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                      {cfg.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="number"
                      min={1}
                      max={168}
                      value={currentVal}
                      onChange={(e) =>
                        setEditingSla({
                          ...editingSla,
                          [cfg.category]: parseInt(e.target.value) || 1
                        })
                      }
                      className="w-16 text-center text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-xs text-slate-400 font-semibold">Hours</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Users Directory */}
      {activeTab === 'users' && (
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Facility Users & Staff Roster
            </h3>
            <span className="text-xs text-slate-400">4 Active Roles: Employee, Supervisor, Technician, Admin</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {users.map((u) => (
              <div key={u.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 flex items-center gap-3">
                <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-xl object-cover ring-2 ring-blue-500/20" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{u.name}</div>
                  <div className="text-[11px] text-slate-500 truncate">{u.department}</div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      {u.role}
                    </span>
                    {u.phone && <span className="text-[10px] text-slate-400">{u.phone}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Supabase Integration Panel */}
      {activeTab === 'supabase' && (
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-600" />
                Supabase PostgreSQL Database Status
              </h3>
              <p className="text-xs text-slate-400">
                Connect your cloud Supabase database for persistent ticket logs across devices
              </p>
            </div>

            <button
              onClick={onOpenSupabaseModal}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-xs flex items-center gap-1.5"
            >
              <Database className="w-4 h-4" /> Open Connection Manager
            </button>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Connection State:</span>
              <span className={`font-bold ${supabaseConfig.isConnected ? 'text-emerald-600' : 'text-slate-500'}`}>
                {supabaseConfig.isConnected ? '● Connected to Supabase' : '○ Offline (Local Storage Active)'}
              </span>
            </div>
            {supabaseConfig.supabaseUrl && (
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Project URL:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{supabaseConfig.supabaseUrl}</span>
              </div>
            )}
            {supabaseConfig.lastSync && (
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Last Synchronized:</span>
                <span className="text-slate-500">{new Date(supabaseConfig.lastSync).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Site Modal */}
      {showAddSite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold">Add New Facility Campus</h3>
            <form onSubmit={handleAddSiteSubmit} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Campus Name (e.g. Hyderabad Innovation Park)"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full text-xs rounded-xl border p-2.5"
              />
              <input
                type="text"
                required
                placeholder="Site Code (e.g. HYD)"
                value={siteCode}
                onChange={(e) => setSiteCode(e.target.value)}
                className="w-full text-xs rounded-xl border p-2.5"
              />
              <input
                type="text"
                required
                placeholder="City (e.g. Hyderabad)"
                value={siteCity}
                onChange={(e) => setSiteCity(e.target.value)}
                className="w-full text-xs rounded-xl border p-2.5"
              />
              <input
                type="text"
                placeholder="Address line"
                value={siteAddress}
                onChange={(e) => setSiteAddress(e.target.value)}
                className="w-full text-xs rounded-xl border p-2.5"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSite(false)}
                  className="px-3 py-1.5 text-xs text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl"
                >
                  Create Site
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Building Modal */}
      {showAddBld && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold">Add Building to Campus</h3>
            <form onSubmit={handleAddBldSubmit} className="space-y-3">
              <select
                value={bldSiteId}
                onChange={(e) => setBldSiteId(e.target.value)}
                className="w-full text-xs rounded-xl border p-2.5"
              >
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
              <input
                type="text"
                required
                placeholder="Building Name (e.g. Tower C - Global Labs)"
                value={bldName}
                onChange={(e) => setBldName(e.target.value)}
                className="w-full text-xs rounded-xl border p-2.5"
              />
              <input
                type="text"
                required
                placeholder="Building Code (e.g. TOW-C)"
                value={bldCode}
                onChange={(e) => setBldCode(e.target.value)}
                className="w-full text-xs rounded-xl border p-2.5"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddBld(false)}
                  className="px-3 py-1.5 text-xs text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl"
                >
                  Create Building
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Area Modal */}
      {showAddArea && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold">Add Area / Zone</h3>
            <form onSubmit={handleAddAreaSubmit} className="space-y-3">
              <select
                value={areaFloorId}
                onChange={(e) => setAreaFloorId(e.target.value)}
                className="w-full text-xs rounded-xl border p-2.5"
              >
                {floors.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                required
                placeholder="Area Name (e.g. Executive Boardroom 601)"
                value={areaName}
                onChange={(e) => setAreaName(e.target.value)}
                className="w-full text-xs rounded-xl border p-2.5"
              />
              <select
                value={areaType}
                onChange={(e) => setAreaType(e.target.value as any)}
                className="w-full text-xs rounded-xl border p-2.5"
              >
                <option value="Meeting Room">Meeting Room</option>
                <option value="Washroom">Washroom</option>
                <option value="Pantry">Pantry</option>
                <option value="Workstation">Workstation Area</option>
                <option value="Reception">Reception</option>
                <option value="Cafeteria">Cafeteria</option>
                <option value="Server Room">Server Room</option>
              </select>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddArea(false)}
                  className="px-3 py-1.5 text-xs text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl"
                >
                  Create Zone & Generate QR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
