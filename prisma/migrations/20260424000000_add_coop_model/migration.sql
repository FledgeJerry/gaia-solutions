-- CreateEnum
CREATE TYPE "CoopRole" AS ENUM ('OWNER', 'EDITOR');

-- CreateTable
CREATE TABLE "Coop" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Coop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoopMember" (
    "id" TEXT NOT NULL,
    "coopId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "CoopRole" NOT NULL DEFAULT 'EDITOR',

    CONSTRAINT "CoopMember_pkey" PRIMARY KEY ("id")
);

-- Migrate HandbookEntry: clear old rows, drop userId, add coopId
TRUNCATE TABLE "HandbookEntry";
ALTER TABLE "HandbookEntry" DROP COLUMN "userId";
ALTER TABLE "HandbookEntry" ADD COLUMN "coopId" TEXT NOT NULL;

-- Drop old unique constraint and add new one
DROP INDEX IF EXISTS "HandbookEntry_userId_fieldId_key";
ALTER TABLE "HandbookEntry" ADD CONSTRAINT "HandbookEntry_coopId_fieldId_key" UNIQUE ("coopId", "fieldId");

-- CoopMember unique constraint
ALTER TABLE "CoopMember" ADD CONSTRAINT "CoopMember_coopId_userId_key" UNIQUE ("coopId", "userId");

-- AddForeignKey
ALTER TABLE "CoopMember" ADD CONSTRAINT "CoopMember_coopId_fkey" FOREIGN KEY ("coopId") REFERENCES "Coop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoopMember" ADD CONSTRAINT "CoopMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HandbookEntry" ADD CONSTRAINT "HandbookEntry_coopId_fkey" FOREIGN KEY ("coopId") REFERENCES "Coop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
