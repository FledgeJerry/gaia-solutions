-- CreateTable
CREATE TABLE "HandbookEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HandbookEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HandbookEntry_userId_fieldId_key" ON "HandbookEntry"("userId", "fieldId");

-- AddForeignKey
ALTER TABLE "HandbookEntry" ADD CONSTRAINT "HandbookEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
