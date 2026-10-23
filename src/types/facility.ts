/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'employee' | 'supervisor' | 'technician' | 'admin';

export type TicketCategory =
  | 'Cleaning / Housekeeping'
  | 'Electrical (E&M)'
  | 'Mechanical'
  | 'HVAC / Air Conditioning'
  | 'Plumbing'
  | 'Carpentry'
  | 'Civil Works'
  | 'Pest Control'
  | 'Furniture'
  | 'Others';

export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type TicketStatus =
  | 'Open'
  | 'Supervisor Review'
  | 'Assigned'
  | 'In Progress'
  | 'On Hold'
  | 'Resolved'
  | 'Reopened'
  | 'Closed'
  | 'Cancelled';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  department: string;
  role: UserRole;
  avatar: string;
  siteId?: string;
  phone?: string;
  specialty?: TicketCategory[];
}

export interface Site {
  id: string;
  name: string;
  code: string;
  city: string;
  address: string;
}

export interface Building {
  id: string;
  siteId: string;
  name: string;
  code: string;
}

export interface Floor {
  id: string;
  buildingId: string;
  name: string;
  level: number;
}

export interface Area {
  id: string;
  floorId: string;
  name: string;
  type: 'Pantry' | 'Washroom' | 'Meeting Room' | 'Workstation' | 'Reception' | 'Server Room' | 'Corridor' | 'Cafeteria' | 'Other';
  qrCode: string;
}

export interface SLAConfig {
  category: TicketCategory;
  targetHours: number; // base SLA in hours
  description: string;
}

export interface TicketAssignment {
  assignedToId: string;
  assignedToName: string;
  assignedById: string;
  assignedByName: string;
  assignedAt: string;
  notes?: string;
}

export interface TicketFeedback {
  rating: number; // 1 - 5
  satisfaction: 'Satisfied' | 'Neutral' | 'Dissatisfied';
  comments: string;
  submittedAt: string;
}

export interface TicketActivityLog {
  id: string;
  ticketId: string;
  action: string;
  performedBy: string;
  performedByName: string;
  timestamp: string;
  comment?: string;
  oldStatus?: TicketStatus;
  newStatus?: TicketStatus;
}

export interface Ticket {
  id: string;
  ticketNumber: string; // e.g. TKT-2026-1001
  title: string;
  description: string;
  category: TicketCategory;
  priority: PriorityLevel;
  status: TicketStatus;
  
  // Location Hierarchy
  siteId: string;
  siteName: string;
  buildingId: string;
  buildingName: string;
  floorId: string;
  floorName: string;
  areaId: string;
  areaName: string;
  
  // Media & Attachments
  photoUrls: string[];
  resolutionPhotoUrls?: string[];
  resolutionNotes?: string;
  
  // Creator
  createdById: string;
  createdByName: string;
  createdByEmail: string;
  createdByDept: string;
  createdAt: string;
  
  // SLA & Timers
  slaHoursTarget: number;
  slaDeadline: string; // ISO string
  resolvedAt?: string;
  closedAt?: string;
  isBreached: boolean;
  
  // Assignment & Resolution
  assignment?: TicketAssignment;
  feedback?: TicketFeedback;
  activityLogs: TicketActivityLog[];
}

export interface InAppNotification {
  id: string;
  recipientId: string; // user id or 'all_supervisors'
  recipientRole?: UserRole;
  title: string;
  message: string;
  ticketId: string;
  ticketNumber: string;
  type: 'creation' | 'assignment' | 'status_change' | 'sla_warning' | 'resolution' | 'feedback' | 'reopened';
  isRead: boolean;
  createdAt: string;
}

export interface SupabaseConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  isConnected: boolean;
  lastSync?: string;
}
