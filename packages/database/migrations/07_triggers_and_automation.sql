-- ==============================================================================
-- PARTNEROS - MIGRATION 07: AUTOMATION TRIGGERS & BUSINESS LOGIC
-- ==============================================================================

-- 1. Strict Immutability Rule for Ledger Entries
CREATE OR REPLACE FUNCTION public.fn_prevent_ledger_tampering()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Ledger entries are strictly immutable. Updates and deletions are prohibited by PartnerOS financial audit policy.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_immutable_ledger ON public.ledger_entries;
CREATE TRIGGER trg_immutable_ledger
BEFORE UPDATE OR DELETE ON public.ledger_entries
FOR EACH ROW EXECUTE FUNCTION public.fn_prevent_ledger_tampering();

-- 2. Automatic Commission Calculation upon Deal Won
CREATE OR REPLACE FUNCTION public.fn_handle_deal_won_commission()
RETURNS TRIGGER AS $$
DECLARE
    v_campaign public.affiliate_campaigns%ROWTYPE;
    v_commission_amount NUMERIC(15, 2);
    v_hold_days INT := 14;
BEGIN
    -- Check if deal just transitioned to 'won' and has an attributed partner
    IF (NEW.status = 'won' AND (OLD.status IS NULL OR OLD.status != 'won') AND NEW.partner_id IS NOT NULL) THEN
        
        -- Find active campaign for this tenant
        SELECT * INTO v_campaign
        FROM public.affiliate_campaigns
        WHERE tenant_id = NEW.tenant_id AND is_active = TRUE
        ORDER BY created_at DESC
        LIMIT 1;

        IF FOUND THEN
            -- Calculate commission based on campaign type
            IF v_campaign.commission_type = 'percentage' THEN
                v_commission_amount := ROUND((NEW.value * (v_campaign.commission_rate / 100.0)), 2);
            ELSE
                v_commission_amount := v_campaign.commission_rate;
            END IF;

            -- Check minimum deal value threshold if set
            IF v_campaign.min_deal_value IS NULL OR NEW.value >= v_campaign.min_deal_value THEN
                -- Insert pending commission
                INSERT INTO public.commissions (
                    tenant_id,
                    partner_id,
                    campaign_id,
                    deal_id,
                    contact_id,
                    deal_value,
                    rate_snapshot,
                    commission_type,
                    amount,
                    status,
                    hold_until
                ) VALUES (
                    NEW.tenant_id,
                    NEW.partner_id,
                    v_campaign.id,
                    NEW.id,
                    NEW.contact_id,
                    NEW.value,
                    v_campaign.commission_rate,
                    v_campaign.commission_type,
                    v_commission_amount,
                    'pending',
                    timezone('utc'::text, now()) + (COALESCE(v_campaign.cookie_window_days, 14) || ' days')::INTERVAL
                )
                ON CONFLICT (deal_id) DO NOTHING;
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_deal_won_commission ON public.crm_deals;
CREATE TRIGGER trg_deal_won_commission
AFTER INSERT OR UPDATE OF status ON public.crm_deals
FOR EACH ROW EXECUTE FUNCTION public.fn_handle_deal_won_commission();

-- 3. Sync Partner Wallet Balance upon Commission Status Changes
CREATE OR REPLACE FUNCTION public.fn_sync_partner_wallet()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure partner wallet row exists
    INSERT INTO public.partner_wallets (partner_id, pending_balance, approved_balance, settled_balance, total_paid)
    VALUES (NEW.partner_id, 0, 0, 0, 0)
    ON CONFLICT (partner_id) DO NOTHING;

    -- Recalculate balances
    UPDATE public.partner_wallets
    SET 
        pending_balance = (
            SELECT COALESCE(SUM(amount), 0) FROM public.commissions 
            WHERE partner_id = NEW.partner_id AND status = 'pending'
        ),
        approved_balance = (
            SELECT COALESCE(SUM(amount), 0) FROM public.commissions 
            WHERE partner_id = NEW.partner_id AND status = 'approved'
        ),
        settled_balance = (
            SELECT COALESCE(SUM(amount), 0) FROM public.commissions 
            WHERE partner_id = NEW.partner_id AND status = 'in_settlement'
        ),
        total_paid = (
            SELECT COALESCE(SUM(amount), 0) FROM public.commissions 
            WHERE partner_id = NEW.partner_id AND status = 'paid'
        ),
        updated_at = timezone('utc'::text, now())
    WHERE partner_id = NEW.partner_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_wallet ON public.commissions;
CREATE TRIGGER trg_sync_wallet
AFTER INSERT OR UPDATE OF status, amount ON public.commissions
FOR EACH ROW EXECUTE FUNCTION public.fn_sync_partner_wallet();
