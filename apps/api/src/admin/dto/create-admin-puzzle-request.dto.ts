export type CreateAdminPuzzleItemRequestDto = {
  text?: unknown;
};

export type CreateAdminPuzzleGroupRequestDto = {
  label?: unknown;
  explanation?: unknown;
  gentleHint?: unknown;
  strongHint?: unknown;
  items?: unknown;
};

export type CreateAdminPuzzleRequestDto = {
  title?: unknown;
  theme?: unknown;
  difficulty?: unknown;
  groupSize?: unknown;
  mistakeLimit?: unknown;
  groups?: unknown;
};
