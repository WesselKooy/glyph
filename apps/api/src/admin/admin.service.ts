import { Injectable, NotFoundException } from "@nestjs/common";
import {
  PuzzleDifficultyFeedback,
  PuzzleFairnessRating,
  type Prisma,
} from "@prisma/client";
import { PrismaService } from "../database/prisma.service";
import { type AdminPuzzleDetailResponseDto } from "./dto/admin-puzzle-detail-response.dto";
import { type AdminPuzzleListResponseDto } from "./dto/admin-puzzle-list-response.dto";

const adminPuzzleListSelect = {
  id: true,
  title: true,
  theme: true,
  difficulty: true,
  status: true,
  createdAt: true,
} satisfies Prisma.PuzzleSelect;

type AdminPuzzleListItem = Prisma.PuzzleGetPayload<{
  select: typeof adminPuzzleListSelect;
}>;

const adminPuzzleDetailSelect = {
  id: true,
  title: true,
  theme: true,
  difficulty: true,
  status: true,
  source: true,
  groupSize: true,
  mistakeLimit: true,
  createdAt: true,
  publishedAt: true,
  groups: {
    select: {
      id: true,
      label: true,
      explanation: true,
      gentleHint: true,
      strongHint: true,
      sortOrder: true,
      items: {
        select: {
          id: true,
          text: true,
          sortOrder: true,
        },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  },
  ratings: {
    select: {
      id: true,
      fairness: true,
      difficultyFeedback: true,
      comment: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  },
} satisfies Prisma.PuzzleSelect;

type AdminPuzzleDetail = Prisma.PuzzleGetPayload<{
  select: typeof adminPuzzleDetailSelect;
}>;

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async listPuzzles(): Promise<AdminPuzzleListResponseDto> {
    const puzzles = await this.prisma.puzzle.findMany({
      orderBy: [{ createdAt: "desc" }, { title: "asc" }],
      select: adminPuzzleListSelect,
    });

    return {
      puzzles: puzzles.map(toAdminPuzzleListItemDto),
    };
  }

  async getPuzzle(puzzleId: string): Promise<AdminPuzzleDetailResponseDto> {
    const puzzle = await this.prisma.puzzle.findUnique({
      where: { id: puzzleId },
      select: adminPuzzleDetailSelect,
    });

    if (!puzzle) {
      throw new NotFoundException(`Puzzle ${puzzleId} was not found.`);
    }

    return toAdminPuzzleDetailDto(puzzle);
  }
}

function toAdminPuzzleListItemDto(puzzle: AdminPuzzleListItem) {
  return {
    id: puzzle.id,
    title: puzzle.title,
    theme: puzzle.theme,
    difficulty: puzzle.difficulty.toLowerCase(),
    status: puzzle.status.toLowerCase(),
    qualityScore: null,
    createdAt: puzzle.createdAt.toISOString(),
  };
}

function toAdminPuzzleDetailDto(
  puzzle: AdminPuzzleDetail,
): AdminPuzzleDetailResponseDto {
  return {
    id: puzzle.id,
    title: puzzle.title,
    theme: puzzle.theme,
    difficulty: puzzle.difficulty.toLowerCase(),
    status: puzzle.status.toLowerCase(),
    source: puzzle.source.toLowerCase(),
    qualityScore: null,
    groupSize: puzzle.groupSize,
    mistakeLimit: puzzle.mistakeLimit,
    createdAt: puzzle.createdAt.toISOString(),
    publishedAt: puzzle.publishedAt?.toISOString() ?? null,
    groups: puzzle.groups.map((group) => ({
      id: group.id,
      label: group.label,
      explanation: group.explanation,
      gentleHint: group.gentleHint,
      strongHint: group.strongHint,
      sortOrder: group.sortOrder,
      items: group.items.map((item) => ({
        id: item.id,
        text: item.text,
        sortOrder: item.sortOrder,
      })),
    })),
    ratings: toRatingSummary(puzzle.ratings),
    validationRuns: {
      status: "not_configured",
      runs: [],
    },
  };
}

function toRatingSummary(
  ratings: AdminPuzzleDetail["ratings"],
): AdminPuzzleDetailResponseDto["ratings"] {
  return {
    total: ratings.length,
    fairness: {
      fair: countRatings(
        ratings,
        (rating) => rating.fairness === PuzzleFairnessRating.FAIR,
      ),
      ambiguous: countRatings(
        ratings,
        (rating) => rating.fairness === PuzzleFairnessRating.AMBIGUOUS,
      ),
      wrong: countRatings(
        ratings,
        (rating) => rating.fairness === PuzzleFairnessRating.WRONG,
      ),
    },
    difficulty: {
      tooEasy: countRatings(
        ratings,
        (rating) =>
          rating.difficultyFeedback === PuzzleDifficultyFeedback.TOO_EASY,
      ),
      right: countRatings(
        ratings,
        (rating) => rating.difficultyFeedback === PuzzleDifficultyFeedback.RIGHT,
      ),
      tooHard: countRatings(
        ratings,
        (rating) =>
          rating.difficultyFeedback === PuzzleDifficultyFeedback.TOO_HARD,
      ),
    },
    recent: ratings.slice(0, 5).map((rating) => ({
      id: rating.id,
      fairness: rating.fairness.toLowerCase(),
      difficulty: rating.difficultyFeedback.toLowerCase(),
      comment: rating.comment,
      createdAt: rating.createdAt.toISOString(),
    })),
  };
}

function countRatings(
  ratings: AdminPuzzleDetail["ratings"],
  predicate: (rating: AdminPuzzleDetail["ratings"][number]) => boolean,
): number {
  return ratings.filter(predicate).length;
}
