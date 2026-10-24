-- Manual rollback for this feature only, AFTER rolling back application code.
-- This removes pending reset codes, never users, passwords, or travel data.
DROP TABLE IF EXISTS "password_reset_codes";
-- Also reconcile migration history with `prisma migrate resolve --rolled-back`
-- if the migration is failed; successful applied migrations require a new forward
-- migration or a restored pre-feature database. Do not alter history blindly.
