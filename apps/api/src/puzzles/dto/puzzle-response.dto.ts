export type PuzzleItemDto = {
  id: string;
  text: string;
};

export type PuzzleResponseDto = {
  id: string;
  title: string;
  theme: string | null;
  difficulty: string;
  groupSize: number;
  mistakesAllowed: number;
  items: PuzzleItemDto[];
};
