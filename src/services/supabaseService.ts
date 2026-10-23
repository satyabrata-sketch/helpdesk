/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseConfig, Ticket, Site, Building, Floor, Area, UserProfile } from '../types/facility';

const SUPABASE_CONFIG_KEY = 'facility_helpdesk_supabase_config';

export function getStoredSupabaseConfig(): SupabaseConfig {
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(SUPABASE_CONFIG_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    }
  } catch (e) {
    console.error('Failed to load supabase config from storage', e);
  }
  return {
    supabaseUrl: '',
    supabaseAnonKey: '',
    isConnected: false
  };
}

export function saveStoredSupabaseConfig(config: SupabaseConfig): void {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(config));
  }
}

let activeSupabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const config = getStoredSupabaseConfig();
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    return null;
  }
  if (!activeSupabaseClient) {
    try {
      activeSupabaseClient = createClient(config.supabaseUrl, config.supabaseAnonKey, {
        auth: { persistSession: false }
      });
    } catch (e) {
      console.error('Error instantiating Supabase client', e);
      return null;
    }
  }
  return activeSupabaseClient;
}

export function resetSupabaseClient(): void {
  activeSupabaseClient = null;
}

export async function testSupabaseConnection(url: string, key: string): Promise<{ success: boolean; message: string; tableFound?: boolean }> {
  try {
    if (!url.startsWith('https://')) {
      return { success: false, message: 'Supabase URL must start with https://' };
    }
    const testClient = createClient(url, key, { auth: { persistSession: false } });
    
    // Attempt to query facility_tickets
    const { data, error } = await testClient.from('facility_tickets').select('id').limit(1);
    
    if (error) {
      // Check if error is table does not exist
      if (error.code === '42P01' || error.message.includes('relation "facility_tickets" does not exist') || error.message.includes('not found')) {
        return {
          success: true,
          tableFound: false,
          message: 'Connection to Supabase successful! However, the "facility_tickets" table has not been created yet. Copy and run the generated SQL migration script in your Supabase SQL Editor.'
        };
      }
      return {
        success: false,
        message: `Supabase returned error: ${error.message} (code: ${error.code})`
      };
    }

    return {
      success: true,
      tableFound: true,
      message: `Successfully connected to Supabase! Found "facility_tickets" table (${data ? data.length : 0} rows found in probe).`
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Failed to connect to Supabase: ${err.message || 'Network error or invalid credentials'}`
    };
  }
}

/**
 * Returns a comprehensive SQL script to create all Facility Helpdesk tables in Supabase
 */
export function generateSupabaseSqlSchema(): string {
  return `-- =====================================================================
-- Facility Helpdesk Management System - Supabase PostgreSQL Schema
-- Run this in your Supabase Project: SQL Editor -> New Query -> Run
-- =====================================================================

-- 1. Create Sites Table
CREATE TABLE IF NOT EXISTS facility_sites (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Buildings Table
CREATE TABLE IF NOT EXISTS facility_buildings (
  id TEXT PRIMARY KEY,
  site_id TEXT REFERENCES facility_sites(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Floors Table
CREATE TABLE IF NOT EXISTS facility_floors (
  id TEXT PRIMARY KEY,
  building_id TEXT REFERENCES facility_buildings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  level INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Areas / Zones Table
CREATE TABLE IF NOT EXISTS facility_areas (
  id TEXT PRIMARY KEY,
  floor_id TEXT REFERENCES facility_floors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  qr_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Users Roster Table
CREATE TABLE IF NOT EXISTS facility_users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  department TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('employee', 'supervisor', 'technician', 'admin')),
  avatar TEXT,
  site_id TEXT,
  phone TEXT,
  specialties TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create SLA Configurations Table
CREATE TABLE IF NOT EXISTS facility_sla_configs (
  category TEXT PRIMARY KEY,
  target_hours INT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create Master Tickets Table
CREATE TABLE IF NOT EXISTS facility_tickets (
  id TEXT PRIMARY KEY,
  ticket_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
  status TEXT NOT NULL CHECK (status IN ('Open', 'Supervisor Review', 'Assigned', 'In Progress', 'On Hold', 'Resolved', 'Reopened', 'Closed', 'Cancelled')),
  
  -- Location Hierarchy denormalized for rapid reporting
  site_id TEXT NOT NULL,
  site_name TEXT NOT NULL,
  building_id TEXT NOT NULL,
  building_name TEXT NOT NULL,
  floor_id TEXT NOT NULL,
  floor_name TEXT NOT NULL,
  area_id TEXT NOT NULL,
  area_name TEXT NOT NULL,
  
  -- Media attachments
  photo_urls TEXT[] DEFAULT '{}',
  resolution_photo_urls TEXT[] DEFAULT '{}',
  resolution_notes TEXT,
  
  -- User metadata
  created_by_id TEXT NOT NULL,
  created_by_name TEXT NOT NULL,
  created_by_email TEXT NOT NULL,
  created_by_dept TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- SLA Targets
  sla_hours_target INT NOT NULL,
  sla_deadline TIMESTAMPTZ NOT NULL,
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  is_breached BOOLEAN DEFAULT FALSE,
  
  -- Assignment (JSONB)
  assignment JSONB,
  
  -- Feedback (JSONB)
  feedback JSONB,
  
  -- Activity Logs (JSONB Array)
  activity_logs JSONB DEFAULT '[]'::jsonb
);

-- 8. Create Indexes for High Performance Querying
CREATE INDEX IF NOT EXISTS idx_facility_tickets_status ON facility_tickets(status);
CREATE INDEX IF NOT EXISTS idx_facility_tickets_site_id ON facility_tickets(site_id);
CREATE INDEX IF NOT EXISTS idx_facility_tickets_category ON facility_tickets(category);
CREATE INDEX IF NOT EXISTS idx_facility_tickets_created_by ON facility_tickets(created_by_id);
CREATE INDEX IF NOT EXISTS idx_facility_tickets_deadline ON facility_tickets(sla_deadline);

-- 9. Enable Row Level Security (RLS) - Permissive for authenticated & anon reads
ALTER TABLE facility_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE facility_buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE facility_floors ENABLE ROW LEVEL SECURITY;
ALTER TABLE facility_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE facility_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE facility_sla_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE facility_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON facility_tickets FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON facility_tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON facility_tickets FOR UPDATE USING (true);

CREATE POLICY "Allow public read on locations" ON facility_sites FOR SELECT USING (true);
CREATE POLICY "Allow public read on buildings" ON facility_buildings FOR SELECT USING (true);
CREATE POLICY "Allow public read on floors" ON facility_floors FOR SELECT USING (true);
CREATE POLICY "Allow public read on areas" ON facility_areas FOR SELECT USING (true);
CREATE POLICY "Allow public read on sla" ON facility_sla_configs FOR SELECT USING (true);
CREATE POLICY "Allow public read on users" ON facility_users FOR SELECT USING (true);
`;
}
