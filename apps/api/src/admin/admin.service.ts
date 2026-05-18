import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import {
  PuzzleDifficulty,
  PuzzleDifficultyFeedback,
  PuzzleFairnessRating,
  PuzzleSource,
  PuzzleStatus,
  PuzzleType,
  type Prisma,
} from "@prisma/client";
import { PrismaService } from "../database/prisma.service";
import { type AdminPuzzleDetailResponseDto } from "./dto/admin-puzzle-detail-response.dto";
import { type AdminPuzzleListResponseDto } from "./dto/admin-puzzle-list-response.dto";
import {
  type CreateAdminPuzzleGroupRequestDto,
  type CreateAdminPuzzleItemRequestDto,
  type CreateAdminPuzzleRequestDto,
} from "./dto/create-admin-puzzle-request.dto";

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

  async createPuzzle(
    body: CreateAdminPuzzleRequestDto,
  ): Promise<AdminPuzzleDetailResponseDto> {
    const input = readCreatePuzzleInput(body);

    const puzzle = await this.prisma.$transaction(async (transaction) => {
      const createdPuzzle = await transaction.puzzle.create({
        data: {
          title: input.title,
          theme: input.theme,
          type: PuzzleType.LINK_GRID,
          status: PuzzleStatus.READY_FOR_REVIEW,
          source: PuzzleSource.MANUAL,
          difficulty: input.difficulty,
          groupSize: input.groupSize,
          mistakeLimit: input.mistakeLimit,
        },
        select: { id: true },
      });

      for (const [groupIndex, group] of input.groups.entries()) {
        const createdGroup = await transaction.puzzleGroup.create({
          data: {
            puzzleId: createdPuzzle.id,
            label: group.label,
            explanation: group.explanation,
            gentleHint: group.gentleHint,
            strongHint: group.strongHint,
            sortOrder: groupIndex,
          },
          select: { id: true },
        });

        await transaction.puzzleItem.createMany({
          data: group.items.map((item, itemIndex) => ({
            puzzleId: createdPuzzle.id,
            groupId: createdGroup.id,
            text: item.text,
            sortOrder: itemIndex,
          })),
        });
      }

      return transaction.puzzle.findUniqueOrThrow({
        where: { id: createdPuzzle.id },
        select: adminPuzzleDetailSelect,
      });
    });

    return toAdminPuzzleDetailDto(puzzle);
  }
}

type CreatePuzzleInput = {
  title: string;
  theme: string | null;
  difficulty: PuzzleDifficulty;
  groupSize: 4;
  mistakeLimit: number;
  groups: CreatePuzzleGroupInput[];
};

type CreatePuzzleGroupInput = {
  label: string;
  explanation: string;
  gentleHint: string | null;
  strongHint: string | null;
  items: CreatePuzzleItemInput[];
};

type CreatePuzzleItemInput = {
  text: string;
};

const difficultyByDtoValue = {
  easy: PuzzleDifficulty.EASY,
  medium: PuzzleDifficulty.MEDIUM,
  hard: PuzzleDifficulty.HARD,
  evil: PuzzleDifficulty.EVIL,
} satisfies Record<CreatePuzzleDifficultyDto, PuzzleDifficulty>;

type CreatePuzzleDifficultyDto = "easy" | "medium" | "hard" | "evil";

function readCreatePuzzleInput(
  body: CreateAdminPuzzleRequestDto,
): CreatePuzzleInput {
  const title = readRequiredString(body.title, "title");
  const theme = readOptionalString(body.theme, "theme");
  const difficulty = readDifficulty(body.difficulty);
  const groupSize = readGroupSize(body.groupSize);
  const mistakeLimit = readMistakeLimit(body.mistakeLimit);
  const groups = readGroups(body.groups, groupSize);

  validateUniqueItemTexts(groups);

  return {
    title,
    theme,
    difficulty,
    groupSize,
    mistakeLimit,
    groups,
  };
}

function readGroups(value: unknown, groupSize: 4): CreatePuzzleGroupInput[] {
  if (!Array.isArray(value)) {
    throw new BadRequestException("groups must be an array.");
  }

  if (value.length !== 3 && value.length !== 4) {
    throw new BadRequestException("groups must contain either 3 or 4 groups.");
  }

  return value.map((group, groupIndex) =>
    readGroup(group, groupIndex, groupSize),
  );
}

function readGroup(
  value: unknown,
  groupIndex: number,
  groupSize: 4,
): CreatePuzzleGroupInput {
  if (!value || typeof value !== "object") {
    throw new BadRequestException(`groups[${groupIndex}] must be an object.`);
  }

  const group = value as CreateAdminPuzzleGroupRequestDto;
  const items = readItems(group.items, groupIndex, groupSize);

  return {
    label: readRequiredString(group.label, `groups[${groupIndex}].label`),
    explanation: readRequiredString(
      group.explanation,
      `groups[${groupIndex}].explanation`,
    ),
    gentleHint: readOptionalString(
      group.gentleHint,
      `groups[${groupIndex}].gentleHint`,
    ),
    strongHint: readOptionalString(
      group.strongHint,
      `groups[${groupIndex}].strongHint`,
    ),
    items,
  };
}

function readItems(
  value: unknown,
  groupIndex: number,
  groupSize: 4,
): CreatePuzzleItemInput[] {
  if (!Array.isArray(value)) {
    throw new BadRequestException(`groups[${groupIndex}].items must be an array.`);
  }

  if (value.length !== groupSize) {
    throw new BadRequestException(
      `groups[${groupIndex}].items must contain exactly ${groupSize} items.`,
    );
  }

  return value.map((item, itemIndex) => {
    if (!item || typeof item !== "object") {
      throw new BadRequestException(
        `groups[${groupIndex}].items[${itemIndex}] must be an object.`,
      );
    }

    const itemInput = item as CreateAdminPuzzleItemRequestDto;

    return {
      text: readRequiredString(
        itemInput.text,
        `groups[${groupIndex}].items[${itemIndex}].text`,
      ),
    };
  });
}

function readDifficulty(value: unknown): PuzzleDifficulty {
  if (typeof value !== "string") {
    throw new BadRequestException(
      "difficulty must be one of: easy, medium, hard, evil.",
    );
  }

  const difficultyValue = value.trim().toLowerCase();

  if (!isCreatePuzzleDifficultyDto(difficultyValue)) {
    throw new BadRequestException(
      "difficulty must be one of: easy, medium, hard, evil.",
    );
  }

  return difficultyByDtoValue[difficultyValue];
}

function isCreatePuzzleDifficultyDto(
  value: string,
): value is CreatePuzzleDifficultyDto {
  return (
    value === "easy" ||
    value === "medium" ||
    value === "hard" ||
    value === "evil"
  );
}

function readGroupSize(value: unknown): 4 {
  if (value !== 4) {
    throw new BadRequestException("groupSize must be 4.");
  }

  return 4;
}

function readMistakeLimit(value: unknown): number {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < 1 ||
    value > 10
  ) {
    throw new BadRequestException(
      "mistakeLimit must be an integer between 1 and 10.",
    );
  }

  return value;
}

function readRequiredString(value: unknown, fieldName: string): string {
  if (typeof value !== "string") {
    throw new BadRequestException(`${fieldName} is required.`);
  }

  const text = value.trim();

  if (text.length === 0) {
    throw new BadRequestException(`${fieldName} cannot be empty.`);
  }

  return text;
}

function readOptionalString(value: unknown, fieldName: string): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new BadRequestException(`${fieldName} must be a string.`);
  }

  const text = value.trim();
  return text.length > 0 ? text : null;
}

function validateUniqueItemTexts(groups: CreatePuzzleGroupInput[]): void {
  const seenTexts = new Set<string>();

  for (const group of groups) {
    for (const item of group.items) {
      const normalizedText = item.text.toLocaleLowerCase();

      if (seenTexts.has(normalizedText)) {
        throw new BadRequestException(
          `item text must be unique within a puzzle: ${item.text}.`,
        );
      }

      seenTexts.add(normalizedText);
    }
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
