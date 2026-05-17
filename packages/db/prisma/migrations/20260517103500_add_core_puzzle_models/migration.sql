-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "PuzzleType" AS ENUM ('LINK_GRID');

-- CreateEnum
CREATE TYPE "PuzzleStatus" AS ENUM ('DRAFT', 'READY_FOR_REVIEW', 'APPROVED', 'REJECTED', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PuzzleSource" AS ENUM ('MANUAL', 'AI_GENERATED');

-- CreateEnum
CREATE TYPE "PuzzleDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD', 'EVIL');

-- CreateEnum
CREATE TYPE "PuzzleFairnessRating" AS ENUM ('FAIR', 'AMBIGUOUS', 'WRONG');

-- CreateEnum
CREATE TYPE "PuzzleDifficultyFeedback" AS ENUM ('TOO_EASY', 'RIGHT', 'TOO_HARD');

-- CreateTable
CREATE TABLE "Puzzle" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "theme" TEXT,
    "type" "PuzzleType" NOT NULL DEFAULT 'LINK_GRID',
    "status" "PuzzleStatus" NOT NULL DEFAULT 'DRAFT',
    "source" "PuzzleSource" NOT NULL DEFAULT 'MANUAL',
    "difficulty" "PuzzleDifficulty" NOT NULL,
    "groupSize" INTEGER NOT NULL DEFAULT 4,
    "mistakeLimit" INTEGER NOT NULL DEFAULT 4,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Puzzle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PuzzleGroup" (
    "id" UUID NOT NULL,
    "puzzleId" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "gentleHint" TEXT,
    "strongHint" TEXT,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PuzzleGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PuzzleItem" (
    "id" UUID NOT NULL,
    "puzzleId" UUID NOT NULL,
    "groupId" UUID NOT NULL,
    "text" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PuzzleItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaySession" (
    "id" UUID NOT NULL,
    "puzzleId" UUID NOT NULL,
    "itemOrderIds" UUID[] DEFAULT ARRAY[]::UUID[],
    "solvedGroupIds" UUID[] DEFAULT ARRAY[]::UUID[],
    "mistakes" INTEGER NOT NULL DEFAULT 0,
    "hintsUsed" INTEGER NOT NULL DEFAULT 0,
    "solved" BOOLEAN NOT NULL DEFAULT false,
    "failed" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlaySession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guess" (
    "id" UUID NOT NULL,
    "playSessionId" UUID NOT NULL,
    "puzzleId" UUID NOT NULL,
    "matchedGroupId" UUID,
    "selectedItemIds" UUID[] DEFAULT ARRAY[]::UUID[],
    "correct" BOOLEAN NOT NULL,
    "nearMiss" BOOLEAN NOT NULL DEFAULT false,
    "mistakeNumber" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Guess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PuzzleRating" (
    "id" UUID NOT NULL,
    "puzzleId" UUID NOT NULL,
    "playSessionId" UUID,
    "fairness" "PuzzleFairnessRating" NOT NULL,
    "difficultyFeedback" "PuzzleDifficultyFeedback" NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PuzzleRating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Puzzle_status_publishedAt_idx" ON "Puzzle"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "Puzzle_type_difficulty_idx" ON "Puzzle"("type", "difficulty");

-- CreateIndex
CREATE INDEX "PuzzleGroup_puzzleId_idx" ON "PuzzleGroup"("puzzleId");

-- CreateIndex
CREATE UNIQUE INDEX "PuzzleGroup_puzzleId_sortOrder_key" ON "PuzzleGroup"("puzzleId", "sortOrder");

-- CreateIndex
CREATE INDEX "PuzzleItem_puzzleId_idx" ON "PuzzleItem"("puzzleId");

-- CreateIndex
CREATE INDEX "PuzzleItem_groupId_idx" ON "PuzzleItem"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "PuzzleItem_groupId_sortOrder_key" ON "PuzzleItem"("groupId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "PuzzleItem_puzzleId_text_key" ON "PuzzleItem"("puzzleId", "text");

-- CreateIndex
CREATE INDEX "PlaySession_puzzleId_idx" ON "PlaySession"("puzzleId");

-- CreateIndex
CREATE INDEX "PlaySession_completedAt_idx" ON "PlaySession"("completedAt");

-- CreateIndex
CREATE INDEX "Guess_playSessionId_idx" ON "Guess"("playSessionId");

-- CreateIndex
CREATE INDEX "Guess_puzzleId_idx" ON "Guess"("puzzleId");

-- CreateIndex
CREATE INDEX "Guess_matchedGroupId_idx" ON "Guess"("matchedGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "PuzzleRating_playSessionId_key" ON "PuzzleRating"("playSessionId");

-- CreateIndex
CREATE INDEX "PuzzleRating_puzzleId_idx" ON "PuzzleRating"("puzzleId");

-- CreateIndex
CREATE INDEX "PuzzleRating_fairness_idx" ON "PuzzleRating"("fairness");

-- CreateIndex
CREATE INDEX "PuzzleRating_difficultyFeedback_idx" ON "PuzzleRating"("difficultyFeedback");

-- AddForeignKey
ALTER TABLE "PuzzleGroup" ADD CONSTRAINT "PuzzleGroup_puzzleId_fkey" FOREIGN KEY ("puzzleId") REFERENCES "Puzzle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PuzzleItem" ADD CONSTRAINT "PuzzleItem_puzzleId_fkey" FOREIGN KEY ("puzzleId") REFERENCES "Puzzle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PuzzleItem" ADD CONSTRAINT "PuzzleItem_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "PuzzleGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaySession" ADD CONSTRAINT "PlaySession_puzzleId_fkey" FOREIGN KEY ("puzzleId") REFERENCES "Puzzle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guess" ADD CONSTRAINT "Guess_playSessionId_fkey" FOREIGN KEY ("playSessionId") REFERENCES "PlaySession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guess" ADD CONSTRAINT "Guess_puzzleId_fkey" FOREIGN KEY ("puzzleId") REFERENCES "Puzzle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guess" ADD CONSTRAINT "Guess_matchedGroupId_fkey" FOREIGN KEY ("matchedGroupId") REFERENCES "PuzzleGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PuzzleRating" ADD CONSTRAINT "PuzzleRating_puzzleId_fkey" FOREIGN KEY ("puzzleId") REFERENCES "Puzzle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PuzzleRating" ADD CONSTRAINT "PuzzleRating_playSessionId_fkey" FOREIGN KEY ("playSessionId") REFERENCES "PlaySession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
