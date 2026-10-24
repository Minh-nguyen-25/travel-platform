-- Additive only: no existing account or travel records are changed.
CREATE TABLE "password_reset_codes" (
    "id" UUID NOT NULL,
    "user_id" INTEGER NOT NULL,
    "code_hash" CHAR(64) NOT NULL,
    "expires_at" TIMESTAMP NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "verified_at" TIMESTAMP,
    "reset_token_hash" CHAR(64),
    "used_at" TIMESTAMP,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "password_reset_codes_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "password_reset_codes_attempts_check" CHECK ("attempts" >= 0)
);
CREATE UNIQUE INDEX "password_reset_codes_user_id_key" ON "password_reset_codes"("user_id");
CREATE INDEX "password_reset_codes_expires_at_idx" ON "password_reset_codes"("expires_at");
ALTER TABLE "password_reset_codes" ADD CONSTRAINT "password_reset_codes_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
