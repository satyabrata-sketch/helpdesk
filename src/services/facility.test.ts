/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSLAHours } from './storageService';
import { generateSupabaseSqlSchema } from './supabaseService';

test('SLA calculation applies category and priority modifiers properly', () => {
  // Cleaning base is 2h
  assert.equal(calculateSLAHours('Cleaning / Housekeeping', 'Medium'), 2);
  assert.equal(calculateSLAHours('Cleaning / Housekeeping', 'Critical'), 1); // 50% minimum 1h
  assert.equal(calculateSLAHours('Cleaning / Housekeeping', 'Low'), 3); // 1.5x

  // Electrical base is 4h
  assert.equal(calculateSLAHours('Electrical (E&M)', 'Medium'), 4);
  assert.equal(calculateSLAHours('Electrical (E&M)', 'Critical'), 2); // 50%
  assert.equal(calculateSLAHours('Electrical (E&M)', 'High'), 3); // 75%

  // HVAC base is 8h
  assert.equal(calculateSLAHours('HVAC / Air Conditioning', 'Medium'), 8);
  assert.equal(calculateSLAHours('HVAC / Air Conditioning', 'Critical'), 4);

  // Civil Works base is 48h
  assert.equal(calculateSLAHours('Civil Works', 'Medium'), 48);
  assert.equal(calculateSLAHours('Civil Works', 'Critical'), 24);
});

test('Supabase schema generator outputs required PostgreSQL tables and RLS', () => {
  const sql = generateSupabaseSqlSchema();
  assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS facility_tickets'));
  assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS facility_sites'));
  assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS facility_buildings'));
  assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS facility_floors'));
  assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS facility_areas'));
  assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS facility_sla_configs'));
  assert.ok(sql.includes('ALTER TABLE facility_tickets ENABLE ROW LEVEL SECURITY'));
});
