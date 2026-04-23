-- AlterTable
ALTER TABLE "User" ADD COLUMN     "ageRange" TEXT,
ADD COLUMN     "biggestBarrier" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "emailSubscribed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "foundingGroup" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "hasIdea" TEXT,
ADD COLUMN     "raceEthnicity" TEXT,
ADD COLUMN     "readinessStage" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "workedAtCoop" TEXT,
ADD COLUMN     "wouldConvert" TEXT;
