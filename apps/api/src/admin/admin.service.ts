import { Injectable } from "@nestjs/common";
import { type Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";
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
