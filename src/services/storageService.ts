/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Site,
  Building,
  Floor,
  Area,
  UserProfile,
  SLAConfig,
  Ticket,
  InAppNotification,
  UserRole,
  TicketCategory,
  PriorityLevel,
  TicketStatus,
  TicketFeedback
} from '../types/facility';
import {
  INITIAL_SITES,
  INITIAL_BUILDINGS,
  INITIAL_FLOORS,
  INITIAL_AREAS,
  INITIAL_USERS,
  INITIAL_SLA_CONFIGS,
  INITIAL_TICKETS,
  INITIAL_NOTIFICATIONS
} from './seedData';
import { getSupabaseClient } from './supabaseService';

const STORAGE_KEYS = {
  SITES: 'facility_sites_v1',
  BUILDINGS: 'facility_buildings_v1',
  FLOORS: 'facility_floors_v1',
  AREAS: 'facility_areas_v1',
  USERS: 'facility_users_v1',
  SLA: 'facility_sla_v1',
  TICKETS: 'facility_tickets_v1',
  NOTIFICATIONS: 'facility_notifications_v1',
  ACTIVE_USER_ID: 'facility_active_user_id_v1'
};

// Generic safe local storage loader
function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(key);
      if (raw) {
        return JSON.parse(raw);
      }
    }
  } catch (err) {
    console.error(`Error loading key ${key} from storage:`, err);
  }
  return defaultValue;
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (err) {
    console.error(`Error saving key ${key} to storage:`, err);
  }
}

// In-memory application state
let sites: Site[] = loadFromStorage(STORAGE_KEYS.SITES, INITIAL_SITES);
let buildings: Building[] = loadFromStorage(STORAGE_KEYS.BUILDINGS, INITIAL_BUILDINGS);
let floors: Floor[] = loadFromStorage(STORAGE_KEYS.FLOORS, INITIAL_FLOORS);
let areas: Area[] = loadFromStorage(STORAGE_KEYS.AREAS, INITIAL_AREAS);
let users: UserProfile[] = loadFromStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
let slaConfigs: SLAConfig[] = loadFromStorage(STORAGE_KEYS.SLA, INITIAL_SLA_CONFIGS);
let tickets: Ticket[] = loadFromStorage(STORAGE_KEYS.TICKETS, INITIAL_TICKETS);
let notifications: InAppNotification[] = loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);

// Active user
const defaultUserId = users[0]?.id || 'user-emp-1';
let activeUserId: string = loadFromStorage(STORAGE_KEYS.ACTIVE_USER_ID, defaultUserId);

type Listener = () => void;
const listeners: Set<Listener> = new Set();

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('Error invoking storage listener', e);
    }
  });
}

export function subscribeToStore(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Getters
export function getSites(): Site[] {
  return sites;
}

export function getBuildings(siteId?: string): Building[] {
  if (siteId) {
    return buildings.filter((b) => b.siteId === siteId);
  }
  return buildings;
}

export function getFloors(buildingId?: string): Floor[] {
  if (buildingId) {
    return floors.filter((f) => f.buildingId === buildingId);
  }
  return floors;
}

export function getAreas(floorId?: string): Area[] {
  if (floorId) {
    return areas.filter((a) => a.floorId === floorId);
  }
  return areas;
}

export function getAllAreas(): Area[] {
  return areas;
}

export function getUsers(): UserProfile[] {
  return users;
}

export function getSLAConfigs(): SLAConfig[] {
  return slaConfigs;
}

export function getTickets(): Ticket[] {
  // Update breach flags dynamically
  const now = new Date();
  let changed = false;
  const updated = tickets.map((t) => {
    if (t.status !== 'Resolved' && t.status !== 'Closed' && t.status !== 'Cancelled') {
      const isPastDeadline = new Date(t.slaDeadline) < now;
      if (t.isBreached !== isPastDeadline) {
        changed = true;
        return { ...t, isBreached: isPastDeadline };
      }
    }
    return t;
  });
  if (changed) {
    tickets = updated;
    saveToStorage(STORAGE_KEYS.TICKETS, tickets);
  }
  return tickets;
}

export function getTicketById(id: string): Ticket | undefined {
  return getTickets().find((t) => t.id === id);
}

export function getNotifications(): InAppNotification[] {
  return notifications;
}

export function getActiveUser(): UserProfile {
  const user = users.find((u) => u.id === activeUserId);
  if (user) return user;
  return users[0];
}

export function setActiveUser(userId: string): void {
  activeUserId = userId;
  saveToStorage(STORAGE_KEYS.ACTIVE_USER_ID, userId);
  notifyListeners();
}

// SLA Calculation Helper
export function calculateSLAHours(category: TicketCategory, priority: PriorityLevel): number {
  const config = slaConfigs.find((c) => c.category === category);
  const baseHours = config ? config.targetHours : 24;

  switch (priority) {
    case 'Critical':
      return Math.max(1, Math.round(baseHours * 0.5));
    case 'High':
      return Math.max(2, Math.round(baseHours * 0.75));
    case 'Medium':
      return baseHours;
    case 'Low':
      return Math.round(baseHours * 1.5);
    default:
      return baseHours;
  }
}

// Helper to add in-app notifications
export function addNotification(notif: Omit<InAppNotification, 'id' | 'createdAt' | 'isRead'>): void {
  const newNotif: InAppNotification = {
    ...notif,
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
    isRead: false
  };
  notifications = [newNotif, ...notifications];
  saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
  notifyListeners();
}

export function markNotificationAsRead(id: string): void {
  notifications = notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
  saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
  notifyListeners();
}

export function markAllNotificationsAsRead(): void {
  notifications = notifications.map((n) => ({ ...n, isRead: true }));
  saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
  notifyListeners();
}

// Create New Ticket
export interface CreateTicketParams {
  title: string;
  description: string;
  category: TicketCategory;
  priority: PriorityLevel;
  siteId: string;
  buildingId: string;
  floorId: string;
  areaId: string;
  photoUrls: string[];
}

export function createTicket(params: CreateTicketParams): Ticket {
  const user = getActiveUser();
  const site = sites.find((s) => s.id === params.siteId) || sites[0];
  const building = buildings.find((b) => b.id === params.buildingId) || buildings[0];
  const floor = floors.find((f) => f.id === params.floorId) || floors[0];
  const area = areas.find((a) => a.id === params.areaId) || areas[0];

  const slaHours = calculateSLAHours(params.category, params.priority);
  const now = new Date();
  const deadline = new Date(now.getTime() + slaHours * 3600 * 1000).toISOString();
  
  const ticketCount = tickets.length + 1001;
  const ticketNumber = `TKT-${now.getFullYear()}-${ticketCount}`;
  const ticketId = `tkt-${Date.now()}`;

  const newTicket: Ticket = {
    id: ticketId,
    ticketNumber,
    title: params.title,
    description: params.description,
    category: params.category,
    priority: params.priority,
    status: 'Open',
    siteId: site.id,
    siteName: site.name,
    buildingId: building.id,
    buildingName: building.name,
    floorId: floor.id,
    floorName: floor.name,
    areaId: area.id,
    areaName: area.name,
    photoUrls: params.photoUrls,
    createdById: user.id,
    createdByName: user.name,
    createdByEmail: user.email,
    createdByDept: user.department,
    createdAt: now.toISOString(),
    slaHoursTarget: slaHours,
    slaDeadline: deadline,
    isBreached: false,
    activityLogs: [
      {
        id: `log-${Date.now()}`,
        ticketId,
        action: 'Complaint Raised',
        performedBy: user.id,
        performedByName: user.name,
        timestamp: now.toISOString(),
        comment: `Raised in ${area.name} (${site.name}). Target SLA: ${slaHours}h.`
      }
    ]
  };

  tickets = [newTicket, ...tickets];
  saveToStorage(STORAGE_KEYS.TICKETS, tickets);

  // Notify supervisors
  addNotification({
    recipientId: 'all_supervisors',
    recipientRole: 'supervisor',
    title: `New Ticket: ${ticketNumber}`,
    message: `${params.priority} priority complaint in ${area.name}: "${params.title}"`,
    ticketId: newTicket.id,
    ticketNumber: newTicket.ticketNumber,
    type: 'creation'
  });

  // Background Supabase Sync if configured
  syncTicketToSupabase(newTicket);

  notifyListeners();
  return newTicket;
}

// Assign Ticket
export function assignTicket(ticketId: string, technicianId: string, notes?: string): void {
  const supervisor = getActiveUser();
  const technician = users.find((u) => u.id === technicianId);
  if (!technician) return;

  const now = new Date().toISOString();
  tickets = tickets.map((t) => {
    if (t.id === ticketId) {
      const updated: Ticket = {
        ...t,
        status: 'Assigned',
        assignment: {
          assignedToId: technician.id,
          assignedToName: technician.name,
          assignedById: supervisor.id,
          assignedByName: supervisor.name,
          assignedAt: now,
          notes: notes || undefined
        },
        activityLogs: [
          ...t.activityLogs,
          {
            id: `log-${Date.now()}`,
            ticketId: t.id,
            action: 'Assigned to Technician',
            performedBy: supervisor.id,
            performedByName: supervisor.name,
            timestamp: now,
            oldStatus: t.status,
            newStatus: 'Assigned',
            comment: `Assigned to ${technician.name}${notes ? `. Notes: "${notes}"` : ''}`
          }
        ]
      };
      syncTicketToSupabase(updated);
      return updated;
    }
    return t;
  });

  saveToStorage(STORAGE_KEYS.TICKETS, tickets);

  // Notify technician
  addNotification({
    recipientId: technician.id,
    recipientRole: 'technician',
    title: `New Assignment`,
    message: `You were assigned ticket ${ticketId} by ${supervisor.name}`,
    ticketId,
    ticketNumber: getTicketById(ticketId)?.ticketNumber || ticketId,
    type: 'assignment'
  });

  notifyListeners();
}

// Update Ticket Status (In Progress, On Hold, Cancelled)
export function updateTicketStatus(
  ticketId: string,
  newStatus: TicketStatus,
  comment?: string,
  resolutionPhotos?: string[],
  resolutionNotes?: string
): void {
  const user = getActiveUser();
  const now = new Date().toISOString();

  tickets = tickets.map((t) => {
    if (t.id === ticketId) {
      const oldStatus = t.status;
      const isResolving = newStatus === 'Resolved';
      const isClosing = newStatus === 'Closed';

      const updated: Ticket = {
        ...t,
        status: newStatus,
        resolvedAt: isResolving ? now : t.resolvedAt,
        closedAt: isClosing ? now : t.closedAt,
        resolutionPhotoUrls: resolutionPhotos || t.resolutionPhotoUrls,
        resolutionNotes: resolutionNotes || t.resolutionNotes,
        activityLogs: [
          ...t.activityLogs,
          {
            id: `log-${Date.now()}`,
            ticketId: t.id,
            action: `Status changed to ${newStatus}`,
            performedBy: user.id,
            performedByName: user.name,
            timestamp: now,
            oldStatus,
            newStatus,
            comment: comment || (resolutionNotes ? `Resolution: ${resolutionNotes}` : undefined)
          }
        ]
      };
      syncTicketToSupabase(updated);
      return updated;
    }
    return t;
  });

  saveToStorage(STORAGE_KEYS.TICKETS, tickets);

  // Notify ticket creator if resolved
  if (newStatus === 'Resolved') {
    const t = getTicketById(ticketId);
    if (t) {
      addNotification({
        recipientId: t.createdById,
        recipientRole: 'employee',
        title: `Ticket Resolved: ${t.ticketNumber}`,
        message: `${user.name} resolved your complaint. Please inspect and confirm closure.`,
        ticketId: t.id,
        ticketNumber: t.ticketNumber,
        type: 'resolution'
      });
    }
  }

  notifyListeners();
}

// Reopen Ticket
export function reopenTicket(ticketId: string, reason: string): void {
  const user = getActiveUser();
  const now = new Date().toISOString();

  tickets = tickets.map((t) => {
    if (t.id === ticketId) {
      const updated: Ticket = {
        ...t,
        status: 'Reopened',
        activityLogs: [
          ...t.activityLogs,
          {
            id: `log-${Date.now()}`,
            ticketId: t.id,
            action: 'Ticket Reopened by Employee',
            performedBy: user.id,
            performedByName: user.name,
            timestamp: now,
            oldStatus: t.status,
            newStatus: 'Reopened',
            comment: `Reopened reason: "${reason}"`
          }
        ]
      };
      syncTicketToSupabase(updated);
      return updated;
    }
    return t;
  });

  saveToStorage(STORAGE_KEYS.TICKETS, tickets);

  // Notify supervisor & assigned tech
  const t = getTicketById(ticketId);
  if (t) {
    addNotification({
      recipientId: t.assignment?.assignedToId || 'all_supervisors',
      title: `Ticket Reopened: ${t.ticketNumber}`,
      message: `${user.name} reported issue not resolved: "${reason}"`,
      ticketId: t.id,
      ticketNumber: t.ticketNumber,
      type: 'reopened'
    });
  }

  notifyListeners();
}

// Submit Feedback & Close Ticket
export function submitFeedbackAndClose(ticketId: string, feedback: TicketFeedback): void {
  const user = getActiveUser();
  const now = new Date().toISOString();

  tickets = tickets.map((t) => {
    if (t.id === ticketId) {
      const updated: Ticket = {
        ...t,
        status: 'Closed',
        closedAt: now,
        feedback,
        activityLogs: [
          ...t.activityLogs,
          {
            id: `log-${Date.now()}`,
            ticketId: t.id,
            action: `Ticket Closed with ${feedback.rating}★ Rating`,
            performedBy: user.id,
            performedByName: user.name,
            timestamp: now,
            oldStatus: t.status,
            newStatus: 'Closed',
            comment: `Employee satisfaction: ${feedback.satisfaction}. Feedback: "${feedback.comments}"`
          }
        ]
      };
      syncTicketToSupabase(updated);
      return updated;
    }
    return t;
  });

  saveToStorage(STORAGE_KEYS.TICKETS, tickets);

  const t = getTicketById(ticketId);
  if (t && t.assignment) {
    addNotification({
      recipientId: t.assignment.assignedToId,
      recipientRole: 'technician',
      title: `Rating Received: ${feedback.rating}★`,
      message: `${feedback.rating} Star rating submitted for ${t.ticketNumber} (${feedback.satisfaction})`,
      ticketId: t.id,
      ticketNumber: t.ticketNumber,
      type: 'feedback'
    });
  }

  notifyListeners();
}

// Location Hierarchy CRUD
export function addSite(name: string, code: string, city: string, address: string): Site {
  const newSite: Site = {
    id: `site-${Date.now()}`,
    name,
    code: code.toUpperCase(),
    city,
    address
  };
  sites = [...sites, newSite];
  saveToStorage(STORAGE_KEYS.SITES, sites);
  notifyListeners();
  return newSite;
}

export function addBuilding(siteId: string, name: string, code: string): Building {
  const newBld: Building = {
    id: `bld-${Date.now()}`,
    siteId,
    name,
    code: code.toUpperCase()
  };
  buildings = [...buildings, newBld];
  saveToStorage(STORAGE_KEYS.BUILDINGS, buildings);
  notifyListeners();
  return newBld;
}

export function addFloor(buildingId: string, name: string, level: number): Floor {
  const newFlr: Floor = {
    id: `flr-${Date.now()}`,
    buildingId,
    name,
    level
  };
  floors = [...floors, newFlr];
  saveToStorage(STORAGE_KEYS.FLOORS, floors);
  notifyListeners();
  return newFlr;
}

export function addArea(floorId: string, name: string, type: Area['type'], qrCode?: string): Area {
  const code = qrCode || `QR-${Date.now().toString(36).toUpperCase()}`;
  const newArea: Area = {
    id: `area-${Date.now()}`,
    floorId,
    name,
    type,
    qrCode: code
  };
  areas = [...areas, newArea];
  saveToStorage(STORAGE_KEYS.AREAS, areas);
  notifyListeners();
  return newArea;
}

export function updateSLAConfig(category: TicketCategory, targetHours: number): void {
  slaConfigs = slaConfigs.map((s) => (s.category === category ? { ...s, targetHours } : s));
  saveToStorage(STORAGE_KEYS.SLA, slaConfigs);
  notifyListeners();
}

export function resetToSeedData(): void {
  sites = [...INITIAL_SITES];
  buildings = [...INITIAL_BUILDINGS];
  floors = [...INITIAL_FLOORS];
  areas = [...INITIAL_AREAS];
  users = [...INITIAL_USERS];
  slaConfigs = [...INITIAL_SLA_CONFIGS];
  tickets = [...INITIAL_TICKETS];
  notifications = [...INITIAL_NOTIFICATIONS];
  activeUserId = users[0].id;

  saveToStorage(STORAGE_KEYS.SITES, sites);
  saveToStorage(STORAGE_KEYS.BUILDINGS, buildings);
  saveToStorage(STORAGE_KEYS.FLOORS, floors);
  saveToStorage(STORAGE_KEYS.AREAS, areas);
  saveToStorage(STORAGE_KEYS.USERS, users);
  saveToStorage(STORAGE_KEYS.SLA, slaConfigs);
  saveToStorage(STORAGE_KEYS.TICKETS, tickets);
  saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
  saveToStorage(STORAGE_KEYS.ACTIVE_USER_ID, activeUserId);

  notifyListeners();
}

// Background Supabase Sync Helper
async function syncTicketToSupabase(ticket: Ticket): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    const payload = {
      id: ticket.id,
      ticket_number: ticket.ticketNumber,
      title: ticket.title,
      description: ticket.description,
      category: ticket.category,
      priority: ticket.priority,
      status: ticket.status,
      site_id: ticket.siteId,
      site_name: ticket.siteName,
      building_id: ticket.buildingId,
      building_name: ticket.buildingName,
      floor_id: ticket.floorId,
      floor_name: ticket.floorName,
      area_id: ticket.areaId,
      area_name: ticket.areaName,
      photo_urls: ticket.photoUrls,
      resolution_photo_urls: ticket.resolutionPhotoUrls || [],
      resolution_notes: ticket.resolutionNotes || null,
      created_by_id: ticket.createdById,
      created_by_name: ticket.createdByName,
      created_by_email: ticket.createdByEmail,
      created_by_dept: ticket.createdByDept,
      created_at: ticket.createdAt,
      sla_hours_target: ticket.slaHoursTarget,
      sla_deadline: ticket.slaDeadline,
      resolved_at: ticket.resolvedAt || null,
      closed_at: ticket.closedAt || null,
      is_breached: ticket.isBreached,
      assignment: ticket.assignment || null,
      feedback: ticket.feedback || null,
      activity_logs: ticket.activityLogs || []
    };

    await supabase.from('facility_tickets').upsert(payload, { onConflict: 'id' });
  } catch (e) {
    console.warn('Silent Supabase sync warning (database may not have table yet):', e);
  }
}
