-- Migration: Convert Referral Rates from 5/10 VC to 3/7 VC
-- Date: 2026-04-15
-- Description: Updates existing wallet data to match new referral reward structure
--   Old: Tier 1 = 5 VC, Tier 2 = 10 VC
--   New: Tier 1 = 3 VC, Tier 2 = 7 VC
--   Conversion: 1 VC = ₦100 (flat rate)

-- IMPORTANT: Run this in a transaction and verify results before committing
BEGIN;

-- ========================================
-- Step 1: Convert Wallet Transactions
-- ========================================

-- Convert Tier 1 transactions: 5 VC → 3 VC
UPDATE wallet_transactions
SET amount = 3
WHERE type::text IN ('referral_pending', 'referral_approved')
AND amount = 5;

-- Convert Tier 2 transactions: 10 VC → 7 VC
UPDATE wallet_transactions
SET amount = 7
WHERE type::text IN ('referral_pending', 'referral_approved')
AND amount = 10;

-- Convert rejected amounts to match new rates
UPDATE wallet_transactions
SET amount = -3
WHERE type::text = 'referral_rejected'
AND amount = -5;

UPDATE wallet_transactions
SET amount = -7
WHERE type::text = 'referral_rejected'
AND amount = -10;

-- ========================================
-- Step 2: Update Referrals Table
-- ========================================

-- Convert creditsAwarded in referrals table
UPDATE referrals
SET "creditsAwarded" = 3
WHERE "creditsAwarded" = 5;

UPDATE referrals
SET "creditsAwarded" = 7
WHERE "creditsAwarded" = 10;

-- ========================================
-- Step 3: Recalculate Wallet Balances
-- ========================================

-- Recalculate pendingBalance (sum of all referral_pending transactions)
WITH pending_totals AS (
  SELECT
    "walletId",
    SUM(amount) as total
  FROM wallet_transactions
  WHERE type::text = 'referral_pending'
  GROUP BY "walletId"
)
UPDATE wallets w
SET "pendingBalance" = COALESCE(pt.total, 0)
FROM pending_totals pt
WHERE w.id = pt."walletId";

-- Recalculate withdrawableBalance (sum of all referral_approved transactions)
WITH approved_totals AS (
  SELECT
    "walletId",
    SUM(amount) as total
  FROM wallet_transactions
  WHERE type::text = 'referral_approved'
  GROUP BY "walletId"
)
UPDATE wallets w
SET "withdrawableBalance" = COALESCE(at.total, 0)
FROM approved_totals at
WHERE w.id = at."walletId";

-- Recalculate totalEarned (sum of all referral transactions)
WITH total_earned AS (
  SELECT
    "walletId",
    SUM(amount) as total
  FROM wallet_transactions
  WHERE type::text IN ('referral_pending', 'referral_approved')
  GROUP BY "walletId"
)
UPDATE wallets w
SET "totalEarned" = COALESCE(te.total, 0)
FROM total_earned te
WHERE w.id = te."walletId";

-- ========================================
-- Verification Queries (run before COMMIT)
-- ========================================

-- Check transaction amounts (should only see 3 and 7, not 5 and 10)
SELECT type::text, amount, COUNT(*) as count
FROM wallet_transactions
WHERE type::text IN ('referral_pending', 'referral_approved')
GROUP BY type, amount
ORDER BY type, amount;

-- Check wallet balances
SELECT
  COUNT(*) as total_wallets,
  SUM("pendingBalance") as total_pending,
  SUM("withdrawableBalance") as total_withdrawable,
  SUM("totalEarned") as total_earned
FROM wallets;

-- Check referrals.creditsAwarded (should only see 3 and 7, not 5 and 10)
SELECT "creditsAwarded", COUNT(*) as count
FROM referrals
WHERE "creditsAwarded" IS NOT NULL
GROUP BY "creditsAwarded"
ORDER BY "creditsAwarded";

-- If everything looks correct, commit:
COMMIT;

-- If something is wrong, rollback:
-- ROLLBACK;
