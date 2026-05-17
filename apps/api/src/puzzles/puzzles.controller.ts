import { Controller, Get, Param } from "@nestjs/common";
import { type PuzzleResponseDto } from "./dto/puzzle-response.dto";
import { PuzzlesService } from "./puzzles.service";

@Controller("puzzles")
export class PuzzlesController {
  constructor(private readonly puzzlesService: PuzzlesService) {}

  @Get("daily")
  async getDailyPuzzle(): Promise<PuzzleResponseDto> {
    return this.puzzlesService.getDailyPuzzle();
  }

  @Get(":id")
  async getPuzzleById(@Param("id") puzzleId: string): Promise<PuzzleResponseDto> {
    return this.puzzlesService.getPuzzleById(puzzleId);
  }
}
