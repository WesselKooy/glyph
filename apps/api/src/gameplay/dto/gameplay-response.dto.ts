export type PlaySessionItemDto = {
  id: string;
  text: string;
};

export type SolvedGroupDto = {
  id: string;
  label: string;
  items: PlaySessionItemDto[];
  explanation: string;
};

export type PlaySessionResponseDto = {
  id: string;
  puzzleId: string;
  mistakes: number;
  mistakesRemaining: number;
  solved: boolean;
  failed: boolean;
  completed: boolean;
  solvedGroupIds: string[];
  items: PlaySessionItemDto[];
};

export type GuessResponseDto = {
  correct: boolean;
  nearMiss: boolean;
  group: SolvedGroupDto | null;
  mistakes: number;
  mistakesRemaining: number;
  solved: boolean;
  failed: boolean;
  completed: boolean;
  solvedGroupIds: string[];
  message: string;
};
