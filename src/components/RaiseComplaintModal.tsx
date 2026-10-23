/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Camera,
  MapPin,
  Sparkles,
  Upload,
  AlertCircle,
  Clock,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';
import {
  TicketCategory,
  PriorityLevel,
  Area
} from '../types/facility';
import {
  getSites,
  getBuildings,
  getFloors,
  getAreas,
  getSLAConfigs,
  calculateSLAHours,
  createTicket
} from '../services/storageService';

interface RaiseComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedArea?: Area | null;
  onTicketCreated?: (ticketId: string) => void;
}

const CATEGORY_ICONS: Record<TicketCategory, string> = {
  'Cleaning / Housekeeping': '🧹',
  'Electrical (E&M)': '⚡',
  'Mechanical': '⚙️',
  'HVAC / Air Conditioning': '❄️',
  'Plumbing': '🚰',
  'Carpentry': '🪚',
  'Civil Works': '🧱',
  'Pest Control': '🐜',
  'Furniture': '🪑',
  'Others': '🔧'
};

const SAMPLE_PHOTO_PRESETS: { label: string; url: string }[] = [
  { label: 'Water Leak', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80' },
  { label: 'Broken AC/Vent', url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80' },
  { label: 'Spill / Mess', url: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600&auto=format&fit=crop&q=80' },
  { label: 'Damaged Furniture', url: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600&auto=format&fit=crop&q=80' }
];

const QUICK_TAGS = [
  { title: 'AC not cooling / warm air', cat: 'HVAC / Air Conditioning' as TicketCategory, priority: 'High' as PriorityLevel },
  { title: 'Water tap leaking / sink overflow', cat: 'Plumbing' as TicketCategory, priority: 'High' as PriorityLevel },
  { title: 'Pantry coffee / liquid spill on floor', cat: 'Cleaning / Housekeeping' as TicketCategory, priority: 'Medium' as PriorityLevel },
  { title: 'Power socket not working / fuse tripped', cat: 'Electrical (E&M)' as TicketCategory, priority: 'Critical' as PriorityLevel },
  { title: 'Meeting room door lock / hinge broken', cat: 'Carpentry' as TicketCategory, priority: 'Low' as PriorityLevel },
  { title: 'Ergonomic chair height lever broken', cat: 'Furniture' as TicketCategory, priority: 'Low' as PriorityLevel }
];

export const RaiseComplaintModal: React.FC<RaiseComplaintModalProps> = ({
  isOpen,
  onClose,
  preselectedArea,
  onTicketCreated
}) => {
  const sites = getSites();
  const slaConfigs = getSLAConfigs();

  const [siteId, setSiteId] = useState(sites[0]?.id || '');
  const [buildingId, setBuildingId] = useState('');
  const [floorId, setFloorId] = useState('');
  const [areaId, setAreaId] = useState('');

  const [category, setCategory] = useState<TicketCategory>('Cleaning / Housekeeping');
  const [priority, setPriority] = useState<PriorityLevel>('Medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle cascaded options
  const buildings = getBuildings(siteId);
  const floors = getFloors(buildingId);
  const areas = getAreas(floorId);

  // Initialize cascade
  useEffect(() => {
    if (sites.length > 0 && !siteId) {
      setSiteId(sites[0].id);
    }
  }, [sites]);

  useEffect(() => {
    if (buildings.length > 0 && (!buildingId || !buildings.some((b) => b.id === buildingId))) {
      setBuildingId(buildings[0].id);
    }
  }, [siteId, buildings]);

  useEffect(() => {
    if (floors.length > 0 && (!floorId || !floors.some((f) => f.id === floorId))) {
      setFloorId(floors[0].id);
    }
  }, [buildingId, floors]);

  useEffect(() => {
    if (areas.length > 0 && (!areaId || !areas.some((a) => a.id === areaId))) {
      setAreaId(areas[0].id);
    }
  }, [floorId, areas]);

  // Handle preselected area from QR code scan
  useEffect(() => {
    if (preselectedArea && isOpen) {
      // Find floor, building, site
      const allFloors = getFloors();
      const targetFloor = allFloors.find((f) => f.id === preselectedArea.floorId);
      if (targetFloor) {
        const allBuildings = getBuildings();
        const targetBld = allBuildings.find((b) => b.id === targetFloor.buildingId);
        if (targetBld) {
          setSiteId(targetBld.siteId);
          setBuildingId(targetBld.id);
          setFloorId(targetFloor.id);
          setAreaId(preselectedArea.id);
        }
      }
    }
  }, [preselectedArea, isOpen]);

  if (!isOpen) return null;

  const currentSLA = calculateSLAHours(category, priority);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setPhotos((prev) => [...prev, uploadEvent.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddPresetPhoto = (url: string) => {
    if (!photos.includes(url)) {
      setPhotos([...photos, url]);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleQuickTag = (tag: typeof QUICK_TAGS[0]) => {
    setTitle(tag.title);
    setCategory(tag.cat);
    setPriority(tag.priority);
    if (!description) {
      setDescription(`Observed ${tag.title.toLowerCase()}. Immediate facility team attention requested.`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Please enter a brief issue headline or select a quick template.');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Please provide a description of the facility issue.');
      return;
    }
    if (!areaId) {
      setErrorMsg('Please select a specific location area / zone.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newTicket = createTicket({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        siteId,
        buildingId,
        floorId,
        areaId,
        photoUrls: photos
      });

      setIsSubmitting(false);
      onTicketCreated?.(newTicket.id);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Failed to submit complaint');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-white/20 rounded-lg text-lg">⚡</span>
              <h2 className="text-xl font-bold tracking-tight">Raise Facility Complaint</h2>
            </div>
            <p className="text-xs text-blue-100 mt-1">
              Target response within minutes. Multi-site tracking & SLA-monitored resolution.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Issue Templates */}
        <div className="px-6 pt-4 pb-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Quick 1-Click Common Issues
            </span>
            <span className="text-[11px] text-slate-400">Tap to autofill in &lt;1 min</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK_TAGS.map((tag, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickTag(tag)}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 transition shadow-xs text-left"
              >
                {tag.title}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 text-sm bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Location Selection */}
          <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-500" />
                Location Hierarchy (Mandatory)
              </label>
              {preselectedArea && (
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Pre-filled via QR Code
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Site / Campus</label>
                <select
                  value={siteId}
                  onChange={(e) => setSiteId(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-2 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                >
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Building</label>
                <select
                  value={buildingId}
                  onChange={(e) => setBuildingId(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-2 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                >
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Floor</label>
                <select
                  value={floorId}
                  onChange={(e) => setFloorId(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-2 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                >
                  {floors.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Area / Zone</label>
                <select
                  value={areaId}
                  onChange={(e) => setAreaId(e.target.value)}
                  className="w-full text-xs font-semibold rounded-lg border border-blue-400 dark:border-blue-600 bg-white dark:bg-slate-800 px-2.5 py-2 text-blue-700 dark:text-blue-300 focus:ring-2 focus:ring-blue-500"
                >
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.type})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 2. Category Cards */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Select Ticket Category
              </label>
              <span className="text-xs font-medium text-slate-500">
                Resolution Target: <strong className="text-blue-600 dark:text-blue-400">{currentSLA} Hours</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {slaConfigs.map((cfg) => {
                const isSelected = category === cfg.category;
                return (
                  <button
                    key={cfg.category}
                    type="button"
                    onClick={() => setCategory(cfg.category)}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 ring-2 ring-blue-500/30'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xl mb-1">{CATEGORY_ICONS[cfg.category]}</div>
                    <div className="text-xs font-semibold leading-tight line-clamp-1">{cfg.category}</div>
                    <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {cfg.targetHours}h base
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Priority Level */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Priority Impact
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { level: 'Low' as PriorityLevel, desc: 'Minor inconvenience (1.5x SLA)', color: 'border-slate-300 hover:border-slate-400' },
                { level: 'Medium' as PriorityLevel, desc: 'Standard operational issue', color: 'border-blue-300 hover:border-blue-400' },
                { level: 'High' as PriorityLevel, desc: 'Business-impacting issue (0.75x SLA)', color: 'border-amber-300 hover:border-amber-400' },
                { level: 'Critical' as PriorityLevel, desc: 'Immediate operational impact (Fast SLA)', color: 'border-rose-400 hover:border-rose-500' }
              ].map((p) => {
                const isSelected = priority === p.level;
                return (
                  <button
                    key={p.level}
                    type="button"
                    onClick={() => setPriority(p.level)}
                    className={`p-2.5 rounded-xl border text-left transition ${p.color} ${
                      isSelected
                        ? p.level === 'Critical'
                          ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-600 ring-2 ring-rose-500/30 font-semibold'
                          : p.level === 'High'
                          ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-600 ring-2 ring-amber-500/30 font-semibold'
                          : 'bg-blue-50 dark:bg-blue-950/50 border-blue-600 ring-2 ring-blue-500/30 font-semibold'
                        : 'bg-white dark:bg-slate-800'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center justify-between">
                      <span>{p.level}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{p.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Issue Title & Description */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Issue Summary / Headline *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. AC blowing warm air in Conference Room Nandi"
                className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Detailed Description *
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide details: exact location notes, when it started, safety risks, or symptoms..."
                className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* 5. Photo Upload & Evidence */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-blue-500" />
                Supporting Photographs (Optional)
              </label>
              <span className="text-[11px] text-slate-400">Helps technician bring exact tools</span>
            </div>

            {/* Photo Preview List */}
            {photos.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {photos.map((photo, index) => (
                  <div key={index} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shadow-xs">
                    <img src={photo} alt="Issue evidence" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(index)}
                      className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full opacity-90 hover:opacity-100 transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-xl cursor-pointer bg-slate-50/50 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-400 transition">
                <Upload className="w-4 h-4 text-blue-500" />
                <span>Upload from Device</span>
                <input type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
              </label>

              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold whitespace-nowrap">Presets:</span>
                {SAMPLE_PHOTO_PRESETS.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleAddPresetPhoto(p.url)}
                    className="px-2 py-1 text-[11px] bg-slate-100 dark:bg-slate-800 rounded-md hover:bg-blue-50 hover:text-blue-600 whitespace-nowrap border border-slate-200 dark:border-slate-700"
                  >
                    + {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-50 rounded-xl transition shadow-md flex items-center gap-2"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Complaint (SLA Starts)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
