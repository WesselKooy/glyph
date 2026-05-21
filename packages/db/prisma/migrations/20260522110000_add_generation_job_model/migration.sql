-- CreateEnum
CREATE TYPE "GenerationJobStatus" AS ENUM ('QUEUED', 'GENERATING', 'PARSING', 'VALIDATING_STRUCTURE', 'VALIDATING_AMBIGUITY', 'SIMULATING_SOLVERS', 'REPAIRING', 'REJECTED', 'READY_FOR_REVIEW', 'APPROVED', 'PUBLISHED', 'FAILED');

-- CreateTable
CREATE TABLE "GenerationJob" (
    "id" UUID NOT NULL,
    "status" "GenerationJobStatus" NOT NULL DEFAULT 'QUEUED',
    "topic" TEXT NOT NULL,
    "difficulty" "PuzzleDifficulty" NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "rawOutput" JSONB,
    "parsedOutput" JSONB,
    "error" TEXT,
    "puzzleId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GenerationJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GenerationJob_status_createdAt_idx" ON "GenerationJob"("status", "createdAt");

-- CreateIndex
CREATE INDEX "GenerationJob_createdAt_idx" ON "GenerationJob"("createdAt");

-- CreateIndex
CREATE INDEX "GenerationJob_puzzleId_idx" ON "GenerationJob"("puzzleId");

-- AddForeignKey
ALTER TABLE "GenerationJob" ADD CONSTRAINT "GenerationJob_puzzleId_fkey" FOREIGN KEY ("puzzleId") REFERENCES "Puzzle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
