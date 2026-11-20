-- ==============================================================================
-- PARTNEROS - MIGRATION 01: EXTENSIONS & ENUMS
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

-- 2. Define Enumerations
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_platform_role') THEN
        CREATE TYPE user_platform_role AS ENUM (
            'super_admin',
            'business_user',
            'partner',
            'hybrid'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tenant_member_role') THEN
        CREATE TYPE tenant_member_role AS ENUM (
            'owner',
            'admin',
            'manager',
            'member',
            'accountant'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'deal_status') THEN
        CREATE TYPE deal_status AS ENUM (
            'open',
            'won',
            'lost',
            'abandoned'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'commission_type') THEN
        CREATE TYPE commission_type AS ENUM (
            'percentage',
            'fixed_amount'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'commission_status') THEN
        CREATE TYPE commission_status AS ENUM (
            'pending',        -- In hold period / waiting verification
            'approved',       -- Verified by business, posted to ledger
            'rejected',       -- Rejected (invalid/fraud/refunded before approval)
            'in_settlement',  -- Batched into current settlement cycle
            'paid',           -- Disbursed to partner account
            'reversed'        -- Refunded or revoked post-approval
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ledger_account_type') THEN
        CREATE TYPE ledger_account_type AS ENUM (
            'partner_receivable',
            'tenant_payable',
            'platform_revenue',
            'escrow_cash'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'settlement_status') THEN
        CREATE TYPE settlement_status AS ENUM (
            'draft',
            'processing',
            'completed',
            'disputed',
            'cancelled'
        );
    END IF;
END $$;
