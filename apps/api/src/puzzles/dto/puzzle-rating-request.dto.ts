export type PuzzleRatingFairnessDto = "fair" | "ambiguous" | "wrong";

export type PuzzleRatingDifficultyDto = "too_easy" | "right" | "too_hard";

export type CreatePuzzleRatingRequestDto = {
  fairness?: unknown;
  difficulty?: unknown;
  comment?: unknown;
};
