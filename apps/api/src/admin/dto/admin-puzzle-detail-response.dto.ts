export type AdminPuzzleDetailItemDto = {
  id: string;
  text: string;
  sortOrder: number;
};

export type AdminPuzzleDetailGroupDto = {
  id: string;
  label: string;
  explanation: string;
  gentleHint: string | null;
  strongHint: string | null;
  sortOrder: number;
  items: AdminPuzzleDetailItemDto[];
};

export type AdminPuzzleRatingSummaryDto = {
  total: number;
  fairness: {
    fair: number;
    ambiguous: number;
    wrong: number;
  };
  difficulty: {
    tooEasy: number;
    right: number;
    tooHard: number;
  };
  recent: AdminPuzzleRecentRatingDto[];
};

export type AdminPuzzleRecentRatingDto = {
  id: string;
  fairness: string;
  difficulty: string;
  comment: string | null;
  createdAt: string;
};

export type AdminPuzzleValidationRunsDto = {
  status: "not_configured";
  runs: [];
};

export type AdminPuzzleDetailResponseDto = {
  id: string;
  title: string;
  theme: string | null;
  difficulty: string;
  status: string;
  source: string;
  qualityScore: number | null;
  groupSize: number;
  mistakeLimit: number;
  createdAt: string;
  publishedAt: string | null;
  groups: AdminPuzzleDetailGroupDto[];
  ratings: AdminPuzzleRatingSummaryDto;
  validationRuns: AdminPuzzleValidationRunsDto;
};
