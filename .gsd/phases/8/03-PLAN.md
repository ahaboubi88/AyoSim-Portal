---
phase: 8
plan: 3
wave: 3
depends_on: ["8.1", "8.2"]
gap_closure: false
---

# Plan 8.3: Cross-Simulator Supabase Auth Sharing & Unified Project Data Model

## Objective
Establish the cross-application Supabase configuration and unified database schema for cloud project saving, so that user circuits saved in Arduino, ESP32, or Raspberry Pi simulators synchronize across the platform and appear in the user's unified dashboard on the AyoSim Portal.

## Context
Load these files for context:
- .gsd/phases/8/RESEARCH.md
- js/supabase-config.js
- js/auth.js
- index.html

## Tasks

<task type="auto">
  <name>Define Unified Project Database Schema (Supabase SQL)</name>
  <files>
    scripts/schema.sql
    docs/DATABASE_SCHEMA.md
  </files>
  <action>
    1. Create `scripts/schema.sql` defining the Postgres schema for Supabase:
       - Table `user_projects`:
         - `id`: UUID PRIMARY KEY DEFAULT gen_random_uuid()
         - `user_id`: UUID REFERENCES auth.users(id) ON DELETE CASCADE
         - `board_type`: TEXT CHECK (board_type IN ('arduino', 'esp32', 'rpi')) NOT NULL
         - `title`: TEXT NOT NULL
         - `description`: TEXT
         - `circuit_data`: JSONB NOT NULL DEFAULT '{}'::jsonb
         - `code`: TEXT NOT NULL DEFAULT ''
         - `thumbnail_url`: TEXT
         - `is_public`: BOOLEAN DEFAULT false
         - `created_at`: TIMESTAMPTZ DEFAULT now()
         - `updated_at`: TIMESTAMPTZ DEFAULT now()
       - Row Level Security (RLS) policies:
         - Users can read their own projects or public projects
         - Users can insert, update, delete only their own projects
       - Auto-update trigger for `updated_at`.
    2. Create `docs/DATABASE_SCHEMA.md` explaining how simulators query and write to this table using the Supabase client.
  </action>
  <verify>
    powershell -Command "Test-Path scripts/schema.sql; Test-Path docs/DATABASE_SCHEMA.md"
  </verify>
  <done>
    `scripts/schema.sql` and `docs/DATABASE_SCHEMA.md` exist with complete RLS-protected database schema.
  </done>
</task>

<task type="auto">
  <name>Add User Projects Manager Module & Portal Profile Integration</name>
  <files>
    js/projects.js
    index.html
    scripts/verify-phase-8.js
  </files>
  <action>
    1. Create `js/projects.js`:
       - Singleton `AyoSimProjects` module interfacing with Supabase `user_projects` table.
       - Methods: `getProjects(boardFilter?)`, `getProjectById(id)`, `saveProject(projectData)`, `deleteProject(id)`.
       - Fallback to `localStorage` when in Demo Auth Mode (`ayosim_demo_projects`).
    2. In `index.html`:
       - Add `<script src="js/projects.js?v=2.3"></script>` after `auth.js`.
       - Add "My Saved Circuits" option to the user profile dropdown menu.
    3. Create `scripts/verify-phase-8.js` to automatically test and validate all Phase 8 deliverables (rewrites in `vercel.json`, sub-paths in `main.js`, schema in `scripts/schema.sql`, and `AyoSimProjects` module export).
  </action>
  <verify>
    powershell -Command "node scripts/verify-phase-8.js"
  </verify>
  <done>
    `js/projects.js` provides project persistence, portal menu includes saved circuits access, and `verify-phase-8.js` passes.
  </done>
</task>
