import { Injectable, NotFoundException } from "@nestjs/common";
import { PuzzleStatus, type Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";
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
