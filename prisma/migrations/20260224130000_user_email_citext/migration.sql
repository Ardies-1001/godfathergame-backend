CREATE EXTENSION IF NOT EXISTS citext;

DROP INDEX IF EXISTS "User_email_key";

UPDATE "User"
SET "email" = lower(btrim("email"));

ALTER TABLE "User"
ALTER COLUMN "email" TYPE CITEXT
USING "email"::citext;

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
