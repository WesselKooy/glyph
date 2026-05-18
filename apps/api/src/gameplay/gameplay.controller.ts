import { Body, Controller, Param, Post } from "@nestjs/common";
import {
  type CreatePlaySessionRequestDto,
  type SubmitGuessRequestDto,
} from "./dto/gameplay-request.dto";
import {
  type GuessResponseDto,
  type PlaySessionResponseDto,
} from "./dto/gameplay-response.dto";
import { GameplayService } from "./gameplay.service";

@Controller()
export class GameplayController {
  constructor(private readonly gameplayService: GameplayService) {}

  @Post("play-sessions")
  async createPlaySession(
    @Body() body: CreatePlaySessionRequestDto,
  ): Promise<PlaySessionResponseDto> {
    return this.gameplayService.createPlaySession(body);
  }

  @Post("play-sessions/:id/guess")
  async submitGuess(
    @Param("id") playSessionId: string,
    @Body() body: SubmitGuessRequestDto,
  ): Promise<GuessResponseDto> {
    return this.gameplayService.submitGuess(playSessionId, body);
  }
}
