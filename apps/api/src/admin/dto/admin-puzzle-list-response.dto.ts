export type AdminPuzzleListItemDto = {
  id: string;
  title: string;
  theme: string | null;
  difficulty: string;
  status: string;
  qualityScore: number | null;
  createdAt: string;
};

export type AdminPuzzleListResponseDto = {
  puzzles: AdminPuzzleListItemDto[];
};
