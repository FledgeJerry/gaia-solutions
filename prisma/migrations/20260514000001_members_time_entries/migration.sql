-- Add MEMBER and CLIENT to Role enum
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'MEMBER';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'CLIENT';

-- Add TimeCategory enum
CREATE TYPE "TimeCategory" AS ENUM ('DEVELOPMENT', 'DESIGN', 'MEETING', 'OPS', 'RESEARCH', 'OTHER');

-- Migrate existing USER rows to MEMBER
UPDATE "User" SET role = 'MEMBER' WHERE role = 'USER';

-- Add contactId to User
ALTER TABLE "User" ADD COLUMN "contactId" TEXT;
ALTER TABLE "User" ADD CONSTRAINT "User_contactId_key" UNIQUE ("contactId");
ALTER TABLE "User" ADD CONSTRAINT "User_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create TimeEntry table
CREATE TABLE "TimeEntry" (
    "id"        TEXT NOT NULL,
    "userId"    TEXT NOT NULL,
    "date"      DATE NOT NULL,
    "hours"     DOUBLE PRECISION NOT NULL,
    "category"  "TimeCategory" NOT NULL DEFAULT 'DEVELOPMENT',
    "notes"     TEXT,
    "orgId"     TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TimeEntry_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE SET NULL ON UPDATE CASCADE;
