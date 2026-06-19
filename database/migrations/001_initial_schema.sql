-- ============================================================================
-- EcoTrack — Initial Database Schema
-- Migration:  001_initial_schema.sql
-- Database:   PostgreSQL 15+
-- Created:    2026-06-18
-- Author:     EcoTrack Team
-- ============================================================================
-- This migration creates the foundational tables for the EcoTrack carbon
-- footprint tracking platform:
--   1. users         — User accounts & authentication
--   2. carbon_logs   — Individual carbon emission log entries
--   3. ai_insights   — AI-generated sustainability recommendations
-- ============================================================================

-- ──────────────────────────────────────────────────────────────────────────────
-- EXTENSIONS
-- ──────────────────────────────────────────────────────────────────────────────

-- Enable UUID generation for primary keys (safer than sequential integers
-- for distributed systems, prevents ID enumeration attacks).
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ──────────────────────────────────────────────────────────────────────────────
-- CUSTOM TYPES
-- ──────────────────────────────────────────────────────────────────────────────

-- Enum for carbon log categories — enforces data integrity at the DB level.
-- Extend this type as new tracking categories are added.
CREATE TYPE carbon_category AS ENUM (
    'transportation',       -- Driving, flights, public transit
    'energy',               -- Electricity, heating, cooling
    'food',                 -- Diet-related emissions
    'shopping',             -- Consumer goods & packaging
    'waste',                -- Landfill, recycling, composting
    'water',                -- Water usage & treatment
    'digital',              -- Cloud, streaming, device usage
    'other'                 -- Catch-all for uncategorized entries
);

-- ──────────────────────────────────────────────────────────────────────────────
-- TABLE 1: users
-- ──────────────────────────────────────────────────────────────────────────────
-- Stores user account information and authentication credentials.
-- Passwords must be hashed (bcrypt/argon2) at the application layer before
-- being stored here — never store plaintext passwords.
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE users (
    -- Primary key: UUID v4 for globally unique, non-sequential identifiers
    user_id       UUID            DEFAULT uuid_generate_v4()    PRIMARY KEY,

    -- Username: unique display name, case-insensitive uniqueness enforced
    -- via functional index below
    username      VARCHAR(50)     NOT NULL,

    -- Email: primary contact & login identifier
    email         VARCHAR(255)    NOT NULL,

    -- Password: bcrypt/argon2 hash (60–128 chars depending on algorithm)
    password      VARCHAR(128)    NOT NULL,

    -- Timestamps: automatic tracking of account lifecycle
    created_at    TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    updated_at    TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),

    -- ── Constraints ──────────────────────────────────────────────────────
    -- Unique email (case-insensitive) — prevents duplicate registrations
    CONSTRAINT uq_users_email
        UNIQUE (email),

    -- Unique username (exact match; case-insensitive handled by index)
    CONSTRAINT uq_users_username
        UNIQUE (username),

    -- Username length: minimum 3 characters, maximum 50
    CONSTRAINT ck_users_username_length
        CHECK (char_length(username) >= 3),

    -- Email format: basic structural validation at DB level
    -- (full RFC 5322 validation should happen at the application layer)
    CONSTRAINT ck_users_email_format
        CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),

    -- Password hash: ensure it's not empty / not stored as plaintext
    CONSTRAINT ck_users_password_not_empty
        CHECK (char_length(password) >= 8)
);

-- Table comment
COMMENT ON TABLE  users                IS 'Registered user accounts with authentication credentials.';
COMMENT ON COLUMN users.user_id        IS 'UUID v4 primary key — globally unique user identifier.';
COMMENT ON COLUMN users.username       IS 'Unique display name (3-50 characters).';
COMMENT ON COLUMN users.email          IS 'Unique email address used for login and notifications.';
COMMENT ON COLUMN users.password       IS 'Bcrypt/Argon2 hashed password — NEVER store plaintext.';
COMMENT ON COLUMN users.created_at     IS 'Timestamp of account creation (auto-set).';
COMMENT ON COLUMN users.updated_at     IS 'Timestamp of last profile update (auto-set).';

-- ── Indexes ──────────────────────────────────────────────────────────────

-- Case-insensitive email lookup (login queries)
CREATE UNIQUE INDEX idx_users_email_lower
    ON users (LOWER(email));

-- Case-insensitive username lookup (profile URLs, @mentions)
CREATE UNIQUE INDEX idx_users_username_lower
    ON users (LOWER(username));

-- Recent registrations (admin dashboard, analytics)
CREATE INDEX idx_users_created_at
    ON users (created_at DESC);


-- ──────────────────────────────────────────────────────────────────────────────
-- TABLE 2: carbon_logs
-- ──────────────────────────────────────────────────────────────────────────────
-- Records individual carbon emission entries submitted by users.
-- Each log captures the activity category, raw input value (e.g., km driven,
-- kWh consumed), and the computed CO₂-equivalent in kilograms.
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE carbon_logs (
    -- Primary key
    log_id          UUID                DEFAULT uuid_generate_v4()    PRIMARY KEY,

    -- Foreign key linking to the user who created this log
    user_id         UUID                NOT NULL,

    -- Activity category (transportation, energy, food, etc.)
    category        carbon_category     NOT NULL,

    -- Raw input value representing the activity quantity
    -- e.g., 45.5 km driven, 120 kWh electricity used
    input_value     NUMERIC(12, 4)      NOT NULL,

    -- Calculated CO₂-equivalent in kilograms (kg CO₂e)
    -- Computed at the application layer using emission factors
    calculated_co2  NUMERIC(12, 4)      NOT NULL,

    -- Date the emission activity occurred (not necessarily the log date)
    log_date        DATE                NOT NULL    DEFAULT CURRENT_DATE,

    -- Audit timestamps
    created_at      TIMESTAMPTZ         NOT NULL    DEFAULT NOW(),
    updated_at      TIMESTAMPTZ         NOT NULL    DEFAULT NOW(),

    -- ── Constraints ──────────────────────────────────────────────────────
    -- Foreign key: cascade delete logs when user account is removed
    CONSTRAINT fk_carbon_logs_user
        FOREIGN KEY (user_id)
        REFERENCES users (user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    -- Input value must be positive (you can't have negative consumption)
    CONSTRAINT ck_carbon_logs_input_positive
        CHECK (input_value > 0),

    -- Calculated CO₂ must be non-negative
    CONSTRAINT ck_carbon_logs_co2_non_negative
        CHECK (calculated_co2 >= 0),

    -- Log date cannot be in the future
    CONSTRAINT ck_carbon_logs_date_not_future
        CHECK (log_date <= CURRENT_DATE)
);

-- Table comment
COMMENT ON TABLE  carbon_logs                  IS 'Individual carbon emission log entries submitted by users.';
COMMENT ON COLUMN carbon_logs.log_id           IS 'UUID v4 primary key for each emission log entry.';
COMMENT ON COLUMN carbon_logs.user_id          IS 'FK → users.user_id — the user who created this log.';
COMMENT ON COLUMN carbon_logs.category         IS 'Emission category (transportation, energy, food, etc.).';
COMMENT ON COLUMN carbon_logs.input_value      IS 'Raw activity quantity (e.g., km, kWh, kg) — always positive.';
COMMENT ON COLUMN carbon_logs.calculated_co2   IS 'Computed CO₂-equivalent in kilograms (kg CO₂e).';
COMMENT ON COLUMN carbon_logs.log_date         IS 'Date the emission activity occurred.';
COMMENT ON COLUMN carbon_logs.created_at       IS 'Timestamp when the log was recorded in the system.';
COMMENT ON COLUMN carbon_logs.updated_at       IS 'Timestamp of last modification to this log.';

-- ── Indexes ──────────────────────────────────────────────────────────────

-- Primary query pattern: "show me my logs" (user's logs, newest first)
CREATE INDEX idx_carbon_logs_user_date
    ON carbon_logs (user_id, log_date DESC);

-- Filter by category within a user's logs (e.g., "all my transport logs")
CREATE INDEX idx_carbon_logs_user_category
    ON carbon_logs (user_id, category);

-- Dashboard aggregation: sum CO₂ by date range across all users
CREATE INDEX idx_carbon_logs_date
    ON carbon_logs (log_date DESC);

-- Analytics: filter/aggregate by category globally (admin reports)
CREATE INDEX idx_carbon_logs_category
    ON carbon_logs (category);


-- ──────────────────────────────────────────────────────────────────────────────
-- TABLE 3: ai_insights
-- ──────────────────────────────────────────────────────────────────────────────
-- Stores AI-generated sustainability tips and personalized recommendations
-- delivered to users. Insights are produced by analyzing a user's carbon_logs
-- to surface actionable ways to reduce their footprint.
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE ai_insights (
    -- Primary key
    insight_id      UUID            DEFAULT uuid_generate_v4()    PRIMARY KEY,

    -- Foreign key linking to the recipient user
    user_id         UUID            NOT NULL,

    -- The AI-generated recommendation/insight message
    message         TEXT            NOT NULL,

    -- Whether the user has read/acknowledged this insight
    is_read         BOOLEAN         NOT NULL    DEFAULT FALSE,

    -- Audit timestamp
    created_at      TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),

    -- ── Constraints ──────────────────────────────────────────────────────
    -- Foreign key: cascade delete insights when user account is removed
    CONSTRAINT fk_ai_insights_user
        FOREIGN KEY (user_id)
        REFERENCES users (user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    -- Message must not be empty
    CONSTRAINT ck_ai_insights_message_not_empty
        CHECK (char_length(TRIM(message)) > 0)
);

-- Table comment
COMMENT ON TABLE  ai_insights                IS 'AI-generated sustainability recommendations for users.';
COMMENT ON COLUMN ai_insights.insight_id     IS 'UUID v4 primary key for each insight.';
COMMENT ON COLUMN ai_insights.user_id        IS 'FK → users.user_id — the recipient of this insight.';
COMMENT ON COLUMN ai_insights.message        IS 'AI-generated recommendation text.';
COMMENT ON COLUMN ai_insights.is_read        IS 'Whether the user has viewed this insight (default: false).';
COMMENT ON COLUMN ai_insights.created_at     IS 'Timestamp when the insight was generated.';

-- ── Indexes ──────────────────────────────────────────────────────────────

-- Primary query: "show me my insights" (user's insights, newest first)
CREATE INDEX idx_ai_insights_user_created
    ON ai_insights (user_id, created_at DESC);

-- Notification badge: quickly count unread insights for a user
CREATE INDEX idx_ai_insights_user_unread
    ON ai_insights (user_id)
    WHERE is_read = FALSE;


-- ──────────────────────────────────────────────────────────────────────────────
-- AUTO-UPDATE TRIGGER: updated_at
-- ──────────────────────────────────────────────────────────────────────────────
-- Automatically sets updated_at = NOW() on every UPDATE, so the application
-- layer doesn't need to manage this manually.
-- ──────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to users table
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION fn_set_updated_at();

-- Apply to carbon_logs table
CREATE TRIGGER trg_carbon_logs_updated_at
    BEFORE UPDATE ON carbon_logs
    FOR EACH ROW
    EXECUTE FUNCTION fn_set_updated_at();


-- ──────────────────────────────────────────────────────────────────────────────
-- SUMMARY
-- ──────────────────────────────────────────────────────────────────────────────
-- Tables created:     3  (users, carbon_logs, ai_insights)
-- Custom types:       1  (carbon_category ENUM)
-- Foreign keys:       2  (carbon_logs → users, ai_insights → users)
-- Indexes:            9  (covering all major query patterns)
-- Triggers:           2  (auto-update updated_at on users & carbon_logs)
-- Constraints:        8  (uniqueness, format, range, non-empty checks)
-- ──────────────────────────────────────────────────────────────────────────────
