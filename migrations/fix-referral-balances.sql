-- Migration: Fix Referral Balances to Match Referrals Source of Truth
-- Date: 2026-04-16
-- Description: The previous migration converted wallet_transactions amounts
--   from 5→3 and 10→7, but several issues remained:
--     1. Some 'referral_rejected' rows still had -5/-10 amounts (9 rows)
--     2. wallet.pendingBalance was never reduced when referrals were
--        approved or rejected, so users had inflated pending balances
--     3. referrals.creditsAwarded was not kept in sync with the real rate
--     4. Ghost wallets existed with balances but no matching referrals
--
-- Rate rule:
--   Tier 1 (<50 credited refs) = 3 VC per referral
--   Tier 2 (>=50 credited refs) = 7 VC per referral
--   1 VC = ₦100 (flat rate)
--
-- Source of truth: the `referrals` table.
--   - status='validating'  → a pending referral  (contributes to pendingBalance)
--   - status='credited'    → an approved referral (contributes to withdrawableBalance)
--   - status='rejected'    → fully reversed, zero contribution
--   - status='clicked'/'expired' → never entered the wallet at all
--
-- IMPORTANT: This script runs in a transaction. Review the verification
--   output before the COMMIT line executes.

BEGIN;

-- ========================================
-- Step 0: Compute each user's tier rate and stash it in a temp table.
--   A user is Tier 2 only once they've crossed 50 credited referrals.
-- ========================================

CREATE TEMP TABLE user_rates AS
SELECT
  r."referrerId" AS user_id,
  SUM(CASE WHEN r.status::text = 'credited'   THEN 1 ELSE 0 END)::int AS credited_count,
  SUM(CASE WHEN r.status::text = 'validating' THEN 1 ELSE 0 END)::int AS validating_count,
  SUM(CASE WHEN r.status::text = 'rejected'   THEN 1 ELSE 0 END)::int AS rejected_count,
  CASE
    WHEN SUM(CASE WHEN r.status::text = 'credited' THEN 1 ELSE 0 END) >= 50
    THEN 7
    ELSE 3
  END::int AS rate
FROM referrals r
GROUP BY r."referrerId";

-- ========================================
-- Step 1: Normalize wallet_transactions amounts to the user's rate
-- ========================================

-- Pending and approved referral transactions should equal the user's rate
UPDATE wallet_transactions wt
SET amount = ur.rate
FROM wallets w, user_rates ur
WHERE wt."walletId" = w.id
  AND w."userId" = ur.user_id
  AND wt.type::text IN ('referral_pending', 'referral_approved')
  AND wt.amount <> ur.rate;

-- Rejected referral transactions should equal the negative rate
UPDATE wallet_transactions wt
SET amount = -ur.rate
FROM wallets w, user_rates ur
WHERE wt."walletId" = w.id
  AND w."userId" = ur.user_id
  AND wt.type::text = 'referral_rejected'
  AND wt.amount <> -ur.rate;

-- ========================================
-- Step 2: Normalize referrals.creditsAwarded
-- ========================================

-- Only credited referrals carry creditsAwarded; everyone else is 0
UPDATE referrals r
SET "creditsAwarded" = ur.rate
FROM user_rates ur
WHERE r."referrerId" = ur.user_id
  AND r.status::text = 'credited'
  AND r."creditsAwarded" <> ur.rate;

UPDATE referrals
SET "creditsAwarded" = 0
WHERE status::text <> 'credited'
  AND "creditsAwarded" <> 0;

-- ========================================
-- Step 3: Recompute wallet balances from the referrals source of truth.
--   pendingBalance      = validating * rate
--   approvedBalance     = 0 (all approvals have been moved to withdrawable
--                            in this dataset; totalWithdrawn is still 0 too)
--   withdrawableBalance = credited * rate - totalWithdrawn
--   totalEarned         = (validating + credited) * rate
--     (rejections were reversed through reverseCredits, which subtracts
--      both pendingBalance and totalEarned)
-- ========================================

UPDATE wallets w
SET
  "pendingBalance"      = ur.validating_count * ur.rate,
  "approvedBalance"     = 0,
  "withdrawableBalance" = GREATEST(0, ur.credited_count * ur.rate - COALESCE(w."totalWithdrawn", 0)),
  "totalEarned"         = (ur.validating_count + ur.credited_count) * ur.rate
FROM user_rates ur
WHERE w."userId" = ur.user_id;

-- Zero out ghost wallets (users with balances but no referrals)
UPDATE wallets w
SET
  "pendingBalance"      = 0,
  "approvedBalance"     = 0,
  "withdrawableBalance" = 0,
  "totalEarned"         = 0
WHERE NOT EXISTS (
  SELECT 1 FROM user_rates ur WHERE ur.user_id = w."userId"
);

-- ========================================
-- Verification — inspect before COMMIT
-- ========================================

-- Distribution of amounts per tx type (should all match user rates)
SELECT type::text, amount, COUNT(*) AS count
FROM wallet_transactions
GROUP BY type, amount
ORDER BY type, amount;

-- Referrals.creditsAwarded distribution
SELECT status::text, "creditsAwarded", COUNT(*) AS count
FROM referrals
GROUP BY status, "creditsAwarded"
ORDER BY status, "creditsAwarded";

-- Spot-check the top wallets vs their referral counts
SELECT
  u.username,
  ur.credited_count    AS credited,
  ur.validating_count  AS validating,
  ur.rejected_count    AS rejected,
  ur.rate,
  w."pendingBalance",
  w."withdrawableBalance",
  w."totalEarned"
FROM wallets w
JOIN users u ON u.id = w."userId"
JOIN user_rates ur ON ur.user_id = w."userId"
WHERE w."totalEarned" > 0
ORDER BY w."totalEarned" DESC
LIMIT 25;

-- Global totals
SELECT
  COUNT(*) AS total_wallets,
  SUM("pendingBalance")      AS total_pending,
  SUM("approvedBalance")     AS total_approved,
  SUM("withdrawableBalance") AS total_withdrawable,
  SUM("totalEarned")         AS total_earned
FROM wallets;

COMMIT;
-- If anything looks wrong, replace COMMIT with ROLLBACK instead.
