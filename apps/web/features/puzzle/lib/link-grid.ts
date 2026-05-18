export type LinkGridDifficulty = "beginner" | "easy" | "medium" | "hard";

export type LinkGridHints = {
  gentle: string;
  strong: string;
};

export type LinkGridGroup = {
  id: string;
  label: string;
  explanation: string;
  hints: LinkGridHints;
  items: readonly string[];
};

export type LinkGridPuzzle = {
  id: string;
  title: string;
  theme: string;
  difficulty: LinkGridDifficulty;
  groupSize: number;
  mistakesAllowed: number;
  groups: readonly LinkGridGroup[];
};

export type LinkGridRenderableItem = {
  id: string;
  puzzleId: string;
  text: string;
};

export function flattenLinkGridPuzzleGroups(
  puzzle: LinkGridPuzzle,
): LinkGridRenderableItem[] {
  return puzzle.groups.flatMap((group) =>
    group.items.map((text, itemIndex) => ({
      id: `${puzzle.id}:${group.id}:${itemIndex}`,
      puzzleId: puzzle.id,
      text,
    })),
  );
}

export function shuffleLinkGridPuzzleItems<Item extends { id: string }>(
  items: readonly Item[],
  seed: string,
): Item[] {
  return shuffleLinkGridItems(items, seed);
}

export function createRenderableLinkGridItems(
  puzzle: LinkGridPuzzle,
  seed = puzzle.id,
): LinkGridRenderableItem[] {
  return shuffleLinkGridItems(flattenLinkGridPuzzleGroups(puzzle), seed);
}

function shuffleLinkGridItems<Item>(
  items: readonly Item[],
  seed: string,
): Item[] {
  const shuffledItems = [...items];
  let randomState = hashSeed(seed);

  for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
    randomState = nextRandomState(randomState);
    const swapIndex = randomState % (index + 1);
    [shuffledItems[index], shuffledItems[swapIndex]] = [
      shuffledItems[swapIndex],
      shuffledItems[index],
    ];
  }

  return shuffledItems;
}

function hashSeed(seed: string): number {
  let hash = 2166136261;

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function nextRandomState(state: number): number {
  return (Math.imul(state, 1664525) + 1013904223) >>> 0;
}
