import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { type CreatePuzzleRatingRequestDto } from "./dto/puzzle-rating-request.dto";
import { type PuzzleRatingResponseDto } from "./dto/puzzle-rating-response.dto";
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

  @Post(":id/rating")
  async createPuzzleRating(
    @Param("id") puzzleId: string,
    @Body() body: CreatePuzzleRatingRequestDto,
  ): Promise<PuzzleRatingResponseDto> {
    return this.puzzlesService.createPuzzleRating(puzzleId, body);
  }
}
