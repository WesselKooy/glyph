const DEFAULT_API_BASE_URL = "http://localhost:3001";

export type AdminPuzzleListItem = {
  id: string;
  title: string;
  theme: string | null;
  difficulty: string;
  status: string;
  qualityScore: number | null;
  createdAt: string;
};

export type AdminPuzzleListResponse = {
  puzzles: AdminPuzzleListItem[];
};

export type AdminPuzzleDetailItem = {
  id: string;
  text: string;
  sortOrder: number;
};

export type AdminPuzzleDetailGroup = {
  id: string;
  label: string;
  explanation: string;
  gentleHint: string | null;
  strongHint: string | null;
  sortOrder: number;
  items: AdminPuzzleDetailItem[];
};

export type AdminPuzzleRatingSummary = {
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
  recent: AdminPuzzleRecentRating[];
};

export type AdminPuzzleRecentRating = {
  id: string;
  fairness: string;
  difficulty: string;
  comment: string | null;
  createdAt: string;
};

export type AdminPuzzleValidationRuns = {
  status: "not_configured";
  runs: [];
};

export type AdminPuzzleDetail = {
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
  groups: AdminPuzzleDetailGroup[];
  ratings: AdminPuzzleRatingSummary;
  validationRuns: AdminPuzzleValidationRuns;
};

export async function fetchAdminPuzzles(): Promise<AdminPuzzleListResponse> {
  return fetchApi<AdminPuzzleListResponse>("/admin/puzzles");
}

export async function fetchAdminPuzzle(
  puzzleId: string,
): Promise<AdminPuzzleDetail> {
  return fetchApi<AdminPuzzleDetail>(`/admin/puzzles/${puzzleId}`);
}

function getApiBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
    DEFAULT_API_BASE_URL
  );
}

async function fetchApi<ResponseBody>(path: string): Promise<ResponseBody> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return response.json() as Promise<ResponseBody>;
}

async function readApiError(response: Response): Promise<string> {
  if (response.status >= 500) {
    return `Admin API returned ${response.status}. Check that the API server and database are running.`;
  }

  try {
    const body = (await response.json()) as { message?: unknown };

    if (typeof body.message === "string" && body.message.length > 0) {
      return body.message;
    }
  } catch {
    // Fall through to the generic status message.
  }

  return `Admin API request failed with status ${response.status}.`;
}
