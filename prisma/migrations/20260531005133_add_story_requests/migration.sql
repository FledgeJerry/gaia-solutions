-- CreateEnum
CREATE TYPE "StoryRequestStatus" AS ENUM ('PENDING', 'REVIEWED', 'CONVERTED', 'DECLINED');

-- CreateTable
CREATE TABLE "StoryRequest" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "orgId" TEXT,
    "submittedById" TEXT,
    "status" "StoryRequestStatus" NOT NULL DEFAULT 'PENDING',
    "convertedToId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoryRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StoryRequest_convertedToId_key" ON "StoryRequest"("convertedToId");

-- AddForeignKey
ALTER TABLE "StoryRequest" ADD CONSTRAINT "StoryRequest_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryRequest" ADD CONSTRAINT "StoryRequest_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryRequest" ADD CONSTRAINT "StoryRequest_convertedToId_fkey" FOREIGN KEY ("convertedToId") REFERENCES "Story"("id") ON DELETE SET NULL ON UPDATE CASCADE;
