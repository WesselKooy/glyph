import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, PuzzleStatus, type PuzzleItem } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";
import {
  type CreatePlaySessionRequestDto,
  type SubmitGuessRequestDto,
} from "./dto/gameplay-request.dto";
import {
  type GuessResponseDto,
  type PlaySessionItemDto,
  type PlaySessionResponseDto,
  type SolvedGroupDto,
} from "./dto/gameplay-response.dto";

const puzzleForSessionSelect = {
  id: true,
  groupSize: true,
  mistakeLimit: true,
  groups: {
    select: {
      id: true,
      label: true,
      explanation: true,
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
  items: {
    select: {
      id: true,
      text: true,
      sortOrder: true,
      groupId: true,
      group: {
        select: {
          sortOrder: true,
        },
      },
    },
    orderBy: [{ group: { sortOrder: "asc" } }, { sortOrder: "asc" }],
  },
} satisfies Prisma.PuzzleSelect;

const playSessionSelect = {
  id: true,
  puzzleId: true,
  itemOrderIds: true,
  solvedGroupIds: true,
  mistakes: true,
  hintsUsed: true,
  solved: true,
  failed: true,
  completedAt: true,
  puzzle: {
    select: puzzleForSessionSelect,
  },
} satisfies Prisma.PlaySessionSelect;

type PuzzleForSession = Prisma.PuzzleGetPayload<{
  select: typeof puzzleForSessionSelect;
}>;

type PlaySessionForGuess = Prisma.PlaySessionGetPayload<{
  select: typeof playSessionSelect;
}>;

@Injectable()
export class GameplayService {
  constructor(private readonly prisma: PrismaService) {}

  async createPlaySession(
    body: CreatePlaySessionRequestDto,
  ): Promise<PlaySessionResponseDto> {
    const puzzleId = readRequiredString(body.puzzleId, "puzzleId");
    const puzzle = await this.prisma.puzzle.findFirst({
      where: {
        id: puzzleId,
        status: PuzzleStatus.PUBLISHED,
      },
      select: puzzleForSessionSelect,
    });

    if (!puzzle) {
      throw new NotFoundException(`Puzzle ${puzzleId} was not found.`);
    }

    const itemOrderIds = shuffleIds(
      puzzle.items.map((item) => item.id),
      crypto.randomUUID(),
    );

    const session = await this.prisma.playSession.create({
      data: {
        puzzleId: puzzle.id,
        itemOrderIds,
        solvedGroupIds: [],
      },
      select: playSessionSelect,
    });

    return toPlaySessionResponseDto(session);
  }

  async submitGuess(
    playSessionId: string,
    body: SubmitGuessRequestDto,
  ): Promise<GuessResponseDto> {
    const selectedItemIds = readSelectedItemIds(body.selectedItemIds);

    return this.prisma.$transaction(async (transaction) => {
      const session = await transaction.playSession.findUnique({
        where: { id: playSessionId },
        select: playSessionSelect,
      });

      if (!session) {
        throw new NotFoundException(`Play session ${playSessionId} was not found.`);
      }

      if (session.completedAt) {
        throw new ConflictException("This play session is already completed.");
      }

      validateSelectedItemCount(selectedItemIds, session.puzzle.groupSize);
      validateItemsBelongToPuzzle(selectedItemIds, session.puzzle.items);
      validateItemsAreUnsolved(selectedItemIds, session);

      const solvedGroup = findSolvedGroup(session, selectedItemIds);
      const correct = solvedGroup !== null;
      const nextMistakes = correct ? session.mistakes : session.mistakes + 1;
      const nextSolvedGroupIds = correct
        ? [...session.solvedGroupIds, solvedGroup.id]
        : session.solvedGroupIds;
      const solved = nextSolvedGroupIds.length === session.puzzle.groups.length;
      const failed = !solved && nextMistakes >= session.puzzle.mistakeLimit;
      const completed = solved || failed;
      const completedAt = completed ? new Date() : null;
      const nearMiss = correct ? false : hasOneAwayGroup(session, selectedItemIds);

      await transaction.guess.create({
        data: {
          playSessionId: session.id,
          puzzleId: session.puzzleId,
          matchedGroupId: solvedGroup?.id ?? null,
          selectedItemIds,
          correct,
          nearMiss,
          mistakeNumber: correct ? null : nextMistakes,
        },
      });

      await transaction.playSession.update({
        where: { id: session.id },
        data: {
          solvedGroupIds: nextSolvedGroupIds,
          mistakes: nextMistakes,
          solved,
          failed,
          completedAt,
        },
      });

      return toGuessResponseDto({
        correct,
        nearMiss,
        group: solvedGroup ? toSolvedGroupDto(solvedGroup) : null,
        mistakes: nextMistakes,
        mistakesRemaining: Math.max(session.puzzle.mistakeLimit - nextMistakes, 0),
        solved,
        failed,
        completed,
        solvedGroupIds: nextSolvedGroupIds,
      });
    });
  }
}

function readRequiredString(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new BadRequestException(`${fieldName} is required.`);
  }

  return value;
}

function readSelectedItemIds(value: unknown): string[] {
  if (!Array.isArray(value)) {
    throw new BadRequestException("selectedItemIds must be an array.");
  }

  if (!value.every((itemId) => typeof itemId === "string")) {
    throw new BadRequestException("selectedItemIds must contain only strings.");
  }

  const selectedItemIds = value.map((itemId) => itemId.trim());

  if (selectedItemIds.some((itemId) => itemId.length === 0)) {
    throw new BadRequestException("selectedItemIds cannot contain empty IDs.");
  }

  if (new Set(selectedItemIds).size !== selectedItemIds.length) {
    throw new BadRequestException("selectedItemIds must be unique.");
  }

  return selectedItemIds;
}

function validateSelectedItemCount(
  selectedItemIds: string[],
  groupSize: number,
): void {
  if (selectedItemIds.length !== groupSize) {
    throw new BadRequestException(`Select exactly ${groupSize} items.`);
  }
}

function validateItemsBelongToPuzzle(
  selectedItemIds: string[],
  puzzleItems: Pick<PuzzleItem, "id">[],
): void {
  const puzzleItemIds = new Set(puzzleItems.map((item) => item.id));

  if (!selectedItemIds.every((itemId) => puzzleItemIds.has(itemId))) {
    throw new BadRequestException("All selected items must belong to the puzzle.");
  }
}

function validateItemsAreUnsolved(
  selectedItemIds: string[],
  session: PlaySessionForGuess,
): void {
  const solvedGroupIds = new Set(session.solvedGroupIds);
  const itemById = new Map(
    session.puzzle.items.map((item) => [item.id, item] as const),
  );
  const hasSolvedItem = selectedItemIds.some((itemId) => {
    const item = itemById.get(itemId);
    return item ? solvedGroupIds.has(item.groupId) : false;
  });

  if (hasSolvedItem) {
    throw new BadRequestException("Selected items cannot include solved groups.");
  }
}

function findSolvedGroup(
  session: PlaySessionForGuess,
  selectedItemIds: string[],
): PuzzleForSession["groups"][number] | null {
  const selectedSet = new Set(selectedItemIds);
  const solvedGroupIds = new Set(session.solvedGroupIds);

  return (
    session.puzzle.groups.find((group) => {
      if (solvedGroupIds.has(group.id)) {
        return false;
      }

      return (
        group.items.length === selectedSet.size &&
        group.items.every((item) => selectedSet.has(item.id))
      );
    }) ?? null
  );
}

function hasOneAwayGroup(
  session: PlaySessionForGuess,
  selectedItemIds: string[],
): boolean {
  const selectedSet = new Set(selectedItemIds);
  const solvedGroupIds = new Set(session.solvedGroupIds);

  return session.puzzle.groups.some((group) => {
    if (solvedGroupIds.has(group.id)) {
      return false;
    }

    const matchCount = group.items.filter((item) => selectedSet.has(item.id)).length;
    return matchCount === session.puzzle.groupSize - 1;
  });
}

function toPlaySessionResponseDto(
  session: PlaySessionForGuess,
): PlaySessionResponseDto {
  const itemById = new Map(
    session.puzzle.items.map((item) => [item.id, { id: item.id, text: item.text }]),
  );

  return {
    id: session.id,
    puzzleId: session.puzzleId,
    mistakes: session.mistakes,
    mistakesRemaining: Math.max(
      session.puzzle.mistakeLimit - session.mistakes,
      0,
    ),
    solved: session.solved,
    failed: session.failed,
    completed: session.completedAt !== null,
    solvedGroupIds: session.solvedGroupIds,
    items: session.itemOrderIds
      .map((itemId) => itemById.get(itemId))
      .filter((item): item is PlaySessionItemDto => item !== undefined),
  };
}

function toGuessResponseDto(result: {
  correct: boolean;
  nearMiss: boolean;
  group: SolvedGroupDto | null;
  mistakes: number;
  mistakesRemaining: number;
  solved: boolean;
  failed: boolean;
  completed: boolean;
  solvedGroupIds: string[];
}): GuessResponseDto {
  return {
    ...result,
    message: getGuessMessage(result),
  };
}

function getGuessMessage(result: {
  correct: boolean;
  nearMiss: boolean;
  solved: boolean;
  failed: boolean;
}): string {
  if (result.solved) {
    return "Puzzle complete.";
  }

  if (result.failed) {
    return "No mistakes remaining. Puzzle failed.";
  }

  if (result.correct) {
    return "Correct.";
  }

  if (result.nearMiss) {
    return "One away.";
  }

  return "Not quite.";
}

function toSolvedGroupDto(
  group: PuzzleForSession["groups"][number],
): SolvedGroupDto {
  return {
    id: group.id,
    label: group.label,
    items: group.items.map((item) => ({
      id: item.id,
      text: item.text,
    })),
    explanation: group.explanation,
  };
}

function shuffleIds(itemIds: string[], seed: string): string[] {
  const shuffledItemIds = [...itemIds];
  let randomState = hashSeed(seed);

  for (let index = shuffledItemIds.length - 1; index > 0; index -= 1) {
    randomState = nextRandomState(randomState);
    const swapIndex = randomState % (index + 1);
    [shuffledItemIds[index], shuffledItemIds[swapIndex]] = [
      shuffledItemIds[swapIndex],
      shuffledItemIds[index],
    ];
  }

  return shuffledItemIds;
}

function hashSeed(seed: string): number {
  let hash = 2166136261;

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function nextRandomState(state: number): number {
  return (Math.imul(state, 1664525) + 1013904223) >>> 0;
}
