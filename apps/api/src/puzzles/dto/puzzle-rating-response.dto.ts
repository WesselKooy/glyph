import { type PuzzleRatingDifficultyDto, type PuzzleRatingFairnessDto } from "./puzzle-rating-request.dto";

export type PuzzleRatingResponseDto = {
  id: string;
  puzzleId: string;
  fairness: PuzzleRatingFairnessDto;
  difficulty: PuzzleRatingDifficultyDto;
  comment: string | null;
  recorded: true;
  createdAt: string;
};
