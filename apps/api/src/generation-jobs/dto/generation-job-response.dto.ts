export type CreateGenerationJobResponseDto = {
  id: string;
  status: string;
};

export type GenerationJobStatusResponseDto = {
  id: string;
  status: string;
  topic: string;
  difficulty: string;
  promptVersion: string;
  model: string;
  puzzleId: string | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
};
