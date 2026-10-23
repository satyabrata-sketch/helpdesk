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
  TicketCategory
} from '../types/facility';

export const INITIAL_SITES: Site[] = [
  {
    id: 'site-ggn',
    name: 'Gurgaon Cyber City Campus',
    code: 'GGN',
    city: 'Gurgaon',
    address: 'DLF Cyber City, Phase III, Sector 24, Gurugram, Haryana 122002'
  },
  {
    id: 'site-blr',
    name: 'Bangalore Tech Park',
    code: 'BLR',
    city: 'Bangalore',
    address: 'Outer Ring Road, Bellandur, Bengaluru, Karnataka 560103'
  },
  {
    id: 'site-mum',
    name: 'Mumbai Financial Centre',
    code: 'MUM',
    city: 'Mumbai',
    address: 'Bandra Kurla Complex, Bandra East, Mumbai, Maharashtra 400051'
  }
];

export const INITIAL_BUILDINGS: Building[] = [
  { id: 'bld-ggn-ta', siteId: 'site-ggn', name: 'Tower A (Executive)', code: 'TOW-A' },
  { id: 'bld-ggn-tb', siteId: 'site-ggn', name: 'Tower B (Engineering)', code: 'TOW-B' },
  { id: 'bld-blr-b1', siteId: 'site-blr', name: 'Building B (Hub)', code: 'BLD-B' },
  { id: 'bld-blr-b2', siteId: 'site-blr', name: 'Building C (Labs)', code: 'BLD-C' },
  { id: 'bld-mum-hq', siteId: 'site-mum', name: 'HQ Alpha Tower', code: 'HQ-ALP' }
];

export const INITIAL_FLOORS: Floor[] = [
  { id: 'flr-ggn-ta-5', buildingId: 'bld-ggn-ta', name: 'Floor 5', level: 5 },
  { id: 'flr-ggn-ta-4', buildingId: 'bld-ggn-ta', name: 'Floor 4', level: 4 },
  { id: 'flr-ggn-tb-2', buildingId: 'bld-ggn-tb', name: 'Floor 2', level: 2 },
  { id: 'flr-blr-b1-3', buildingId: 'bld-blr-b1', name: 'Floor 3', level: 3 },
  { id: 'flr-blr-b1-1', buildingId: 'bld-blr-b1', name: 'Ground / Reception', level: 0 },
  { id: 'flr-mum-hq-8', buildingId: 'bld-mum-hq', name: 'Floor 8 (Executive Suite)', level: 8 }
];

export const INITIAL_AREAS: Area[] = [
  { id: 'area-ggn-pantry5', floorId: 'flr-ggn-ta-5', name: 'Executive Pantry East', type: 'Pantry', qrCode: 'GGN-TOWA-FL05-PANTRY' },
  { id: 'area-ggn-washroom5', floorId: 'flr-ggn-ta-5', name: 'Central Washroom (Male/Female)', type: 'Washroom', qrCode: 'GGN-TOWA-FL05-WASHROOM' },
  { id: 'area-ggn-boardroom', floorId: 'flr-ggn-ta-5', name: 'Boardroom Everest (501)', type: 'Meeting Room', qrCode: 'GGN-TOWA-FL05-MR501' },
  { id: 'area-ggn-workstation', floorId: 'flr-ggn-ta-5', name: 'Workstations Bay 5A-5D', type: 'Workstation', qrCode: 'GGN-TOWA-FL05-WS5A' },
  { id: 'area-ggn-cafeteria', floorId: 'flr-ggn-tb-2', name: 'Main Cafeteria & Dining', type: 'Cafeteria', qrCode: 'GGN-TOWB-FL02-CAFE' },
  { id: 'area-blr-rec', floorId: 'flr-blr-b1-1', name: 'Main Lobby & Reception', type: 'Reception', qrCode: 'BLR-BLDB-FL00-RECEPT' },
  { id: 'area-blr-mr302', floorId: 'flr-blr-b1-3', name: 'Conference Room Nandi (302)', type: 'Meeting Room', qrCode: 'BLR-BLDB-FL03-MR302' },
  { id: 'area-blr-open3', floorId: 'flr-blr-b1-3', name: 'Open Workspace Zone 3C', type: 'Workstation', qrCode: 'BLR-BLDB-FL03-WS3C' },
  { id: 'area-blr-pantry3', floorId: 'flr-blr-b1-3', name: 'Pantry & Coffee Kiosk', type: 'Pantry', qrCode: 'BLR-BLDB-FL03-PANTRY' },
  { id: 'area-mum-exec', floorId: 'flr-mum-hq-8', name: 'Board of Directors Suite', type: 'Meeting Room', qrCode: 'MUM-HQ-FL08-BOD' }
];

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user-emp-1',
    name: 'Priya Sharma',
    email: 'priya.sharma@enterprise.com',
    department: 'Product Marketing',
    role: 'employee',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    siteId: 'site-ggn',
    phone: '+91 98112 34567'
  },
  {
    id: 'user-emp-2',
    name: 'Rohan Mehta',
    email: 'rohan.mehta@enterprise.com',
    department: 'Engineering Platforms',
    role: 'employee',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    siteId: 'site-blr',
    phone: '+91 98223 45678'
  },
  {
    id: 'user-sup-1',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@facility.com',
    department: 'Facility Operations (North)',
    role: 'supervisor',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    siteId: 'site-ggn',
    phone: '+91 98765 43210'
  },
  {
    id: 'user-sup-2',
    name: 'Sunita Pillai',
    email: 'sunita.pillai@facility.com',
    department: 'Facility Operations (South)',
    role: 'supervisor',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    siteId: 'site-blr',
    phone: '+91 98450 12345'
  },
  {
    id: 'user-tech-1',
    name: 'Amit Verma',
    email: 'amit.verma@facilityvendor.com',
    department: 'E&M & HVAC Services',
    role: 'technician',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    siteId: 'site-ggn',
    phone: '+91 99100 88221',
    specialty: ['Electrical (E&M)', 'HVAC / Air Conditioning', 'Mechanical']
  },
  {
    id: 'user-tech-2',
    name: 'Suresh Nair',
    email: 'suresh.nair@facilityvendor.com',
    department: 'Plumbing & Water Systems',
    role: 'technician',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    siteId: 'site-ggn',
    phone: '+91 99200 77334',
    specialty: ['Plumbing', 'Civil Works']
  },
  {
    id: 'user-tech-3',
    name: 'Ramesh Yadav',
    email: 'ramesh.yadav@cleanfacility.com',
    department: 'Housekeeping & Hygiene',
    role: 'technician',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    siteId: 'site-ggn',
    phone: '+91 98990 66442',
    specialty: ['Cleaning / Housekeeping', 'Pest Control']
  },
  {
    id: 'user-tech-4',
    name: 'Deepak Joshi',
    email: 'deepak.joshi@fixworks.com',
    department: 'Carpentry & Fitments',
    role: 'technician',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    siteId: 'site-blr',
    phone: '+91 98440 55113',
    specialty: ['Carpentry', 'Furniture', 'Civil Works']
  },
  {
    id: 'user-admin-1',
    name: 'Vikram Malhotra',
    email: 'vikram.malhotra@enterprise.com',
    department: 'Global Workplace & Real Estate',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    siteId: 'site-ggn',
    phone: '+91 98100 11223'
  }
];

export const INITIAL_SLA_CONFIGS: SLAConfig[] = [
  { category: 'Cleaning / Housekeeping', targetHours: 2, description: 'Spills, trash clearance, restroom cleaning, sanitization' },
  { category: 'Electrical (E&M)', targetHours: 4, description: 'Power sockets, lighting fixtures, circuit trips, UPS feeds' },
  { category: 'Plumbing', targetHours: 4, description: 'Tap leaks, washbasin clogs, flushing mechanisms, water supply' },
  { category: 'HVAC / Air Conditioning', targetHours: 8, description: 'Temperature controls, airflow issues, chiller leaks, cooling unit noise' },
  { category: 'Mechanical', targetHours: 8, description: 'Motor drives, exhaust systems, elevator minor issues, automatic doors' },
  { category: 'Pest Control', targetHours: 12, description: 'Insect sightings, rodent trap checks, deep fumigation requests' },
  { category: 'Carpentry', targetHours: 24, description: 'Door hinges, door locks, desk laminates, acoustic panel repairs' },
  { category: 'Furniture', targetHours: 24, description: 'Ergonomic chair cylinders, broken table legs, partition repairs' },
  { category: 'Civil Works', targetHours: 48, description: 'Tile replacement, wall touch-ups, false ceiling panels, water seepage' },
  { category: 'Others', targetHours: 24, description: 'General miscellaneous maintenance or uncategorized complaints' }
];

const now = new Date();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600 * 1000).toISOString();
const hoursFromNow = (h: number) => new Date(now.getTime() + h * 3600 * 1000).toISOString();

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'tkt-1001',
    ticketNumber: 'TKT-2026-1001',
    title: 'Severe water leakage in Central Washroom basin',
    description: 'Under-counter pipe connector has ruptured, pooling water on the tiles. Slip hazard for employees.',
    category: 'Plumbing',
    priority: 'High',
    status: 'In Progress',
    siteId: 'site-ggn',
    siteName: 'Gurgaon Cyber City Campus',
    buildingId: 'bld-ggn-ta',
    buildingName: 'Tower A (Executive)',
    floorId: 'flr-ggn-ta-5',
    floorName: 'Floor 5',
    areaId: 'area-ggn-washroom5',
    areaName: 'Central Washroom (Male/Female)',
    photoUrls: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80'],
    createdById: 'user-emp-1',
    createdByName: 'Priya Sharma',
    createdByEmail: 'priya.sharma@enterprise.com',
    createdByDept: 'Product Marketing',
    createdAt: hoursAgo(2.5),
    slaHoursTarget: 4,
    slaDeadline: hoursFromNow(1.5),
    isBreached: false,
    assignment: {
      assignedToId: 'user-tech-2',
      assignedToName: 'Suresh Nair',
      assignedById: 'user-sup-1',
      assignedByName: 'Rajesh Kumar',
      assignedAt: hoursAgo(2.0),
      notes: 'Carrying 1/2 inch PVC compression coupling and pipe wrench. Water supply isolated.'
    },
    activityLogs: [
      {
        id: 'log-1',
        ticketId: 'tkt-1001',
        action: 'Complaint Raised',
        performedBy: 'user-emp-1',
        performedByName: 'Priya Sharma',
        timestamp: hoursAgo(2.5),
        comment: 'High priority complaint lodged via mobile portal.'
      },
      {
        id: 'log-2',
        ticketId: 'tkt-1001',
        action: 'Technician Assigned',
        performedBy: 'user-sup-1',
        performedByName: 'Rajesh Kumar',
        timestamp: hoursAgo(2.0),
        comment: 'Assigned to Suresh Nair (Plumbing Team).',
        oldStatus: 'Open',
        newStatus: 'Assigned'
      },
      {
        id: 'log-3',
        ticketId: 'tkt-1001',
        action: 'Work Started',
        performedBy: 'user-tech-2',
        performedByName: 'Suresh Nair',
        timestamp: hoursAgo(1.5),
        comment: 'On-site: Main valve shut off. Disassembling damaged gasket.',
        oldStatus: 'Assigned',
        newStatus: 'In Progress'
      }
    ]
  },
  {
    id: 'tkt-1002',
    ticketNumber: 'TKT-2026-1002',
    title: 'AC unit blowing warm air during client meeting',
    description: 'Cassette AC unit in Conference Room Nandi is emitting warm humid air. Temperature reached 27°C during international client session.',
    category: 'HVAC / Air Conditioning',
    priority: 'High',
    status: 'Assigned',
    siteId: 'site-blr',
    siteName: 'Bangalore Tech Park',
    buildingId: 'bld-blr-b1',
    buildingName: 'Building B (Hub)',
    floorId: 'flr-blr-b1-3',
    floorName: 'Floor 3',
    areaId: 'area-blr-mr302',
    areaName: 'Conference Room Nandi (302)',
    photoUrls: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80'],
    createdById: 'user-emp-2',
    createdByName: 'Rohan Mehta',
    createdByEmail: 'rohan.mehta@enterprise.com',
    createdByDept: 'Engineering Platforms',
    createdAt: hoursAgo(9.5),
    slaHoursTarget: 8,
    slaDeadline: hoursAgo(1.5), // Breached
    isBreached: true,
    assignment: {
      assignedToId: 'user-tech-1',
      assignedToName: 'Amit Verma',
      assignedById: 'user-sup-2',
      assignedByName: 'Sunita Pillai',
      assignedAt: hoursAgo(8.0),
      notes: 'Check secondary refrigerant loop pressure and actuator valve.'
    },
    activityLogs: [
      {
        id: 'log-10',
        ticketId: 'tkt-1002',
        action: 'Complaint Raised',
        performedBy: 'user-emp-2',
        performedByName: 'Rohan Mehta',
        timestamp: hoursAgo(9.5)
      },
      {
        id: 'log-11',
        ticketId: 'tkt-1002',
        action: 'SLA Breached Alert',
        performedBy: 'system',
        performedByName: 'System SLA Engine',
        timestamp: hoursAgo(1.5),
        comment: 'Target SLA of 8 hours exceeded. Escalation alert fired to Facility Lead.'
      }
    ]
  },
  {
    id: 'tkt-1003',
    ticketNumber: 'TKT-2026-1003',
    title: 'Coffee spill and uncleaned countertops in Executive Pantry',
    description: 'Milk and coffee spilt across counter and trash bin overflowing after morning townhall meeting.',
    category: 'Cleaning / Housekeeping',
    priority: 'Medium',
    status: 'Resolved',
    siteId: 'site-ggn',
    siteName: 'Gurgaon Cyber City Campus',
    buildingId: 'bld-ggn-ta',
    buildingName: 'Tower A (Executive)',
    floorId: 'flr-ggn-ta-5',
    floorName: 'Floor 5',
    areaId: 'area-ggn-pantry5',
    areaName: 'Executive Pantry East',
    photoUrls: ['https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600&auto=format&fit=crop&q=80'],
    resolutionPhotoUrls: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80'],
    resolutionNotes: 'Sanitized all quartz countertops, emptied organic bins, refilled tissue dispensers and mop-cleaned pantry floor with antibacterial cleaner.',
    createdById: 'user-emp-1',
    createdByName: 'Priya Sharma',
    createdByEmail: 'priya.sharma@enterprise.com',
    createdByDept: 'Product Marketing',
    createdAt: hoursAgo(3.0),
    slaHoursTarget: 2,
    slaDeadline: hoursAgo(1.0),
    resolvedAt: hoursAgo(0.5),
    isBreached: false,
    assignment: {
      assignedToId: 'user-tech-3',
      assignedToName: 'Ramesh Yadav',
      assignedById: 'user-sup-1',
      assignedByName: 'Rajesh Kumar',
      assignedAt: hoursAgo(2.5)
    },
    activityLogs: [
      {
        id: 'log-20',
        ticketId: 'tkt-1003',
        action: 'Complaint Raised',
        performedBy: 'user-emp-1',
        performedByName: 'Priya Sharma',
        timestamp: hoursAgo(3.0)
      },
      {
        id: 'log-21',
        ticketId: 'tkt-1003',
        action: 'Resolved',
        performedBy: 'user-tech-3',
        performedByName: 'Ramesh Yadav',
        timestamp: hoursAgo(0.5),
        comment: 'Counters scrubbed, garbage replaced, floor mopped.'
      }
    ]
  },
  {
    id: 'tkt-1004',
    ticketNumber: 'TKT-2026-1004',
    title: 'Complete power strip failure across Workstation Bay 5B',
    description: 'Under-desk wire conduit tripped. 4 dual-monitor workstations have suddenly lost power. Employees unable to work.',
    category: 'Electrical (E&M)',
    priority: 'Critical',
    status: 'In Progress',
    siteId: 'site-ggn',
    siteName: 'Gurgaon Cyber City Campus',
    buildingId: 'bld-ggn-ta',
    buildingName: 'Tower A (Executive)',
    floorId: 'flr-ggn-ta-5',
    floorName: 'Floor 5',
    areaId: 'area-ggn-workstation',
    areaName: 'Workstations Bay 5A-5D',
    photoUrls: ['https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80'],
    createdById: 'user-emp-1',
    createdByName: 'Priya Sharma',
    createdByEmail: 'priya.sharma@enterprise.com',
    createdByDept: 'Product Marketing',
    createdAt: hoursAgo(1.0),
    slaHoursTarget: 2, // Critical reduced SLA
    slaDeadline: hoursFromNow(1.0),
    isBreached: false,
    assignment: {
      assignedToId: 'user-tech-1',
      assignedToName: 'Amit Verma',
      assignedById: 'user-sup-1',
      assignedByName: 'Rajesh Kumar',
      assignedAt: hoursAgo(0.8),
      notes: 'Investigating MCB panel in electrical riser closet 5E.'
    },
    activityLogs: [
      {
        id: 'log-30',
        ticketId: 'tkt-1004',
        action: 'CRITICAL Ticket Created',
        performedBy: 'user-emp-1',
        performedByName: 'Priya Sharma',
        timestamp: hoursAgo(1.0),
        comment: 'Critical business impact: 4 engineers blocked.'
      },
      {
        id: 'log-31',
        ticketId: 'tkt-1004',
        action: 'Fast Dispatched',
        performedBy: 'user-sup-1',
        performedByName: 'Rajesh Kumar',
        timestamp: hoursAgo(0.8),
        comment: 'Assigned on urgent basis to Amit Verma.'
      }
    ]
  },
  {
    id: 'tkt-1005',
    ticketNumber: 'TKT-2026-1005',
    title: 'Hinges detached on Main Pantry crockery storage cabinet',
    description: 'Upper hinge screws stripped out of particle board. Wooden cabinet door hanging loosely and could fall.',
    category: 'Carpentry',
    priority: 'Low',
    status: 'Closed',
    siteId: 'site-blr',
    siteName: 'Bangalore Tech Park',
    buildingId: 'bld-blr-b1',
    buildingName: 'Building B (Hub)',
    floorId: 'flr-blr-b1-3',
    floorName: 'Floor 3',
    areaId: 'area-blr-pantry3',
    areaName: 'Pantry & Coffee Kiosk',
    photoUrls: ['https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600&auto=format&fit=crop&q=80'],
    resolutionPhotoUrls: ['https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=600&auto=format&fit=crop&q=80'],
    resolutionNotes: 'Installed heavy-duty Blum steel hinge plate reinforcement with 35mm anchor dowels. Tested alignment.',
    createdById: 'user-emp-2',
    createdByName: 'Rohan Mehta',
    createdByEmail: 'rohan.mehta@enterprise.com',
    createdByDept: 'Engineering Platforms',
    createdAt: hoursAgo(28),
    slaHoursTarget: 24,
    slaDeadline: hoursAgo(4),
    resolvedAt: hoursAgo(8),
    closedAt: hoursAgo(6),
    isBreached: false,
    assignment: {
      assignedToId: 'user-tech-4',
      assignedToName: 'Deepak Joshi',
      assignedById: 'user-sup-2',
      assignedByName: 'Sunita Pillai',
      assignedAt: hoursAgo(26)
    },
    feedback: {
      rating: 5,
      satisfaction: 'Satisfied',
      comments: 'Fixed quickly and reinforced even better than before. Excellent craftmanship!',
      submittedAt: hoursAgo(6)
    },
    activityLogs: [
      {
        id: 'log-40',
        ticketId: 'tkt-1005',
        action: 'Closed with 5-Star Rating',
        performedBy: 'user-emp-2',
        performedByName: 'Rohan Mehta',
        timestamp: hoursAgo(6),
        comment: 'Customer confirmed satisfaction.'
      }
    ]
  },
  {
    id: 'tkt-1006',
    ticketNumber: 'TKT-2026-1006',
    title: 'Fruit flies spotted around recycling bins in Main Cafeteria',
    description: 'Pest activity observed around organic waste stations in Cafeteria Dining zone.',
    category: 'Pest Control',
    priority: 'Medium',
    status: 'Open',
    siteId: 'site-ggn',
    siteName: 'Gurgaon Cyber City Campus',
    buildingId: 'bld-ggn-tb',
    buildingName: 'Tower B (Engineering)',
    floorId: 'flr-ggn-tb-2',
    floorName: 'Floor 2',
    areaId: 'area-ggn-cafeteria',
    areaName: 'Main Cafeteria & Dining',
    photoUrls: [],
    createdById: 'user-emp-1',
    createdByName: 'Priya Sharma',
    createdByEmail: 'priya.sharma@enterprise.com',
    createdByDept: 'Product Marketing',
    createdAt: hoursAgo(0.4),
    slaHoursTarget: 12,
    slaDeadline: hoursFromNow(11.6),
    isBreached: false,
    activityLogs: [
      {
        id: 'log-50',
        ticketId: 'tkt-1006',
        action: 'Complaint Logged',
        performedBy: 'user-emp-1',
        performedByName: 'Priya Sharma',
        timestamp: hoursAgo(0.4),
        comment: 'New complaint entered into triage backlog.'
      }
    ]
  }
];

export const INITIAL_NOTIFICATIONS: InAppNotification[] = [
  {
    id: 'notif-1',
    recipientId: 'user-sup-1',
    recipientRole: 'supervisor',
    title: 'CRITICAL Ticket Raised',
    message: 'TKT-2026-1004 (Workstation Power Outage) raised in Gurgaon Tower A, Floor 5.',
    ticketId: 'tkt-1004',
    ticketNumber: 'TKT-2026-1004',
    type: 'creation',
    isRead: false,
    createdAt: hoursAgo(1.0)
  },
  {
    id: 'notif-2',
    recipientId: 'user-sup-2',
    recipientRole: 'supervisor',
    title: 'SLA Breach Warning',
    message: 'TKT-2026-1002 (AC unit warm air in MR 302) has breached the 8h SLA target!',
    ticketId: 'tkt-1002',
    ticketNumber: 'TKT-2026-1002',
    type: 'sla_warning',
    isRead: false,
    createdAt: hoursAgo(1.5)
  },
  {
    id: 'notif-3',
    recipientId: 'user-emp-1',
    recipientRole: 'employee',
    title: 'Complaint Resolved: Please Review',
    message: 'TKT-2026-1003 (Executive Pantry cleaning) has been marked Resolved by Ramesh Yadav. Please provide feedback.',
    ticketId: 'tkt-1003',
    ticketNumber: 'TKT-2026-1003',
    type: 'resolution',
    isRead: false,
    createdAt: hoursAgo(0.5)
  },
  {
    id: 'notif-4',
    recipientId: 'user-tech-1',
    recipientRole: 'technician',
    title: 'New Urgent Assignment',
    message: 'You have been assigned to Critical ticket TKT-2026-1004 by Rajesh Kumar.',
    ticketId: 'tkt-1004',
    ticketNumber: 'TKT-2026-1004',
    type: 'assignment',
    isRead: false,
    createdAt: hoursAgo(0.8)
  }
];
