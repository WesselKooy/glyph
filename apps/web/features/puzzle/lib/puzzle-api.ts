const DEFAULT_API_BASE_URL = "http://localhost:3001";

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

export type PlaySessionResponseDto = {
  id: string;
  puzzleId: string;
  mistakes: number;
  mistakesRemaining: number;
  solved: boolean;
  failed: boolean;
  completed: boolean;
  solvedGroupIds: string[];
  items: PuzzleItemDto[];
};

export type SolvedGroupDto = {
  id: string;
  label: string;
  items: PuzzleItemDto[];
  explanation: string;
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

export type PuzzleRatingFairness = "fair" | "ambiguous" | "wrong";

export type PuzzleRatingDifficulty = "too_easy" | "right" | "too_hard";

export type PuzzleRatingResponseDto = {
  id: string;
  puzzleId: string;
  fairness: PuzzleRatingFairness;
  difficulty: PuzzleRatingDifficulty;
  comment: string | null;
  recorded: true;
  createdAt: string;
};

export type PlayablePuzzle = Omit<PuzzleResponseDto, "items"> & {
  items: PuzzleItemDto[];
  playSessionId: string;
};

export async function startDailyPuzzle(): Promise<PlayablePuzzle> {
  const puzzle = await fetchApi<PuzzleResponseDto>("/puzzles/daily");
  const playSession = await fetchApi<PlaySessionResponseDto>("/play-sessions", {
    method: "POST",
    body: JSON.stringify({ puzzleId: puzzle.id }),
  });

  return {
    ...puzzle,
    items: playSession.items,
    playSessionId: playSession.id,
  };
}

export async function submitPuzzleGuess(
  playSessionId: string,
  selectedItemIds: string[],
): Promise<GuessResponseDto> {
  return fetchApi<GuessResponseDto>(`/play-sessions/${playSessionId}/guess`, {
    method: "POST",
    body: JSON.stringify({ selectedItemIds }),
  });
}

export async function submitPuzzleRating(
  puzzleId: string,
  rating: {
    fairness: PuzzleRatingFairness;
    difficulty: PuzzleRatingDifficulty;
    comment?: string;
  },
): Promise<PuzzleRatingResponseDto> {
  return fetchApi<PuzzleRatingResponseDto>(`/puzzles/${puzzleId}/rating`, {
    method: "POST",
    body: JSON.stringify(rating),
  });
}

function getApiBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
    DEFAULT_API_BASE_URL
  );
}

async function fetchApi<ResponseBody>(
  path: string,
  init?: RequestInit,
): Promise<ResponseBody> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return response.json() as Promise<ResponseBody>;
}

async function readApiError(response: Response): Promise<string> {
  if (response.status >= 500) {
    return `Puzzle API returned ${response.status}. Check that the API server and database are running.`;
  }

  try {
    const body = (await response.json()) as { message?: unknown };

    if (typeof body.message === "string" && body.message.length > 0) {
      return body.message;
    }
  } catch {
    // Fall through to the generic status message.
  }

  return `Puzzle API request failed with status ${response.status}.`;
}
