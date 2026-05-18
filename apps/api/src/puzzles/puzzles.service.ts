import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import {
  PuzzleDifficultyFeedback,
  PuzzleFairnessRating,
  PuzzleStatus,
  type Prisma,
} from "@prisma/client";
import { PrismaService } from "../database/prisma.service";
import {
  type CreatePuzzleRatingRequestDto,
  type PuzzleRatingDifficultyDto,
  type PuzzleRatingFairnessDto,
} from "./dto/puzzle-rating-request.dto";
import { type PuzzleRatingResponseDto } from "./dto/puzzle-rating-response.dto";
import { type PuzzleResponseDto } from "./dto/puzzle-response.dto";

const puzzleForPlaySelect = {
  id: true,
  title: true,
  theme: true,
  difficulty: true,
  groupSize: true,
  mistakeLimit: true,
  publishedAt: true,
  items: {
    select: {
      id: true,
      text: true,
      sortOrder: true,
      group: {
        select: {
          sortOrder: true,
        },
      },
    },
    orderBy: [{ group: { sortOrder: "asc" } }, { sortOrder: "asc" }],
  },
} satisfies Prisma.PuzzleSelect;

type PuzzleForPlay = Prisma.PuzzleGetPayload<{
  select: typeof puzzleForPlaySelect;
}>;

const fairnessByDtoValue = {
  fair: PuzzleFairnessRating.FAIR,
  ambiguous: PuzzleFairnessRating.AMBIGUOUS,
  wrong: PuzzleFairnessRating.WRONG,
} satisfies Record<PuzzleRatingFairnessDto, PuzzleFairnessRating>;

const fairnessDtoByModelValue = {
  [PuzzleFairnessRating.FAIR]: "fair",
  [PuzzleFairnessRating.AMBIGUOUS]: "ambiguous",
  [PuzzleFairnessRating.WRONG]: "wrong",
} satisfies Record<PuzzleFairnessRating, PuzzleRatingFairnessDto>;

const difficultyByDtoValue = {
  too_easy: PuzzleDifficultyFeedback.TOO_EASY,
  right: PuzzleDifficultyFeedback.RIGHT,
  too_hard: PuzzleDifficultyFeedback.TOO_HARD,
} satisfies Record<PuzzleRatingDifficultyDto, PuzzleDifficultyFeedback>;

const difficultyDtoByModelValue = {
  [PuzzleDifficultyFeedback.TOO_EASY]: "too_easy",
  [PuzzleDifficultyFeedback.RIGHT]: "right",
  [PuzzleDifficultyFeedback.TOO_HARD]: "too_hard",
} satisfies Record<PuzzleDifficultyFeedback, PuzzleRatingDifficultyDto>;

@Injectable()
export class PuzzlesService {
  constructor(private readonly prisma: PrismaService) {}

  async getDailyPuzzle(): Promise<PuzzleResponseDto> {
    const puzzle = await this.prisma.puzzle.findFirst({
      where: {
        status: PuzzleStatus.PUBLISHED,
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "asc" }],
      select: puzzleForPlaySelect,
    });

    if (!puzzle) {
      throw new NotFoundException("No published puzzle is available.");
    }

    return toPuzzleResponseDto(puzzle);
  }

  async getPuzzleById(puzzleId: string): Promise<PuzzleResponseDto> {
    const puzzle = await this.prisma.puzzle.findFirst({
      where: {
        id: puzzleId,
        status: PuzzleStatus.PUBLISHED,
      },
      select: puzzleForPlaySelect,
    });

    if (!puzzle) {
      throw new NotFoundException(`Puzzle ${puzzleId} was not found.`);
    }

    return toPuzzleResponseDto(puzzle);
  }

  async createPuzzleRating(
    puzzleId: string,
    body: CreatePuzzleRatingRequestDto,
  ): Promise<PuzzleRatingResponseDto> {
    const puzzle = await this.prisma.puzzle.findUnique({
      where: { id: puzzleId },
      select: { id: true },
    });

    if (!puzzle) {
      throw new NotFoundException(`Puzzle ${puzzleId} was not found.`);
    }

    const rating = await this.prisma.puzzleRating.create({
      data: {
        puzzleId: puzzle.id,
        fairness: readFairness(body.fairness),
        difficultyFeedback: readDifficulty(body.difficulty),
        comment: readOptionalComment(body.comment),
      },
      select: {
        id: true,
        puzzleId: true,
        fairness: true,
        difficultyFeedback: true,
        comment: true,
        createdAt: true,
      },
    });

    return {
      id: rating.id,
      puzzleId: rating.puzzleId,
      fairness: fairnessDtoByModelValue[rating.fairness],
      difficulty: difficultyDtoByModelValue[rating.difficultyFeedback],
      comment: rating.comment,
      recorded: true,
      createdAt: rating.createdAt.toISOString(),
    };
  }
}

function readFairness(value: unknown): PuzzleFairnessRating {
  if (isPuzzleRatingFairnessDto(value)) {
    return fairnessByDtoValue[value];
  }

  throw new BadRequestException(
    "fairness must be one of: fair, ambiguous, wrong.",
  );
}

function readDifficulty(value: unknown): PuzzleDifficultyFeedback {
  if (isPuzzleRatingDifficultyDto(value)) {
    return difficultyByDtoValue[value];
  }

  throw new BadRequestException(
    "difficulty must be one of: too_easy, right, too_hard.",
  );
}

function readOptionalComment(value: unknown): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new BadRequestException("comment must be a string when provided.");
  }

  const comment = value.trim();
  return comment.length > 0 ? comment : null;
}

function isPuzzleRatingFairnessDto(
  value: unknown,
): value is PuzzleRatingFairnessDto {
  return (
    value === "fair" || value === "ambiguous" || value === "wrong"
  );
}

function isPuzzleRatingDifficultyDto(
  value: unknown,
): value is PuzzleRatingDifficultyDto {
  return (
    value === "too_easy" || value === "right" || value === "too_hard"
  );
}

function toPuzzleResponseDto(puzzle: PuzzleForPlay): PuzzleResponseDto {
  return {
    id: puzzle.id,
    title: puzzle.title,
    theme: puzzle.theme,
    difficulty: puzzle.difficulty.toLowerCase(),
    groupSize: puzzle.groupSize,
    mistakesAllowed: puzzle.mistakeLimit,
    items: puzzle.items.map((item) => ({
      id: item.id,
      text: item.text,
    })),
  };
}
