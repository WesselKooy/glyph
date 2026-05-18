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

export async function fetchAdminPuzzles(): Promise<AdminPuzzleListResponse> {
  return fetchApi<AdminPuzzleListResponse>("/admin/puzzles");
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
