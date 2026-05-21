import { describe, expect, it } from "vitest";
import { LinkGridPuzzleCandidateSchema } from "./link-grid-generation";

describe("LinkGridPuzzleCandidateSchema", () => {
  it("accepts a valid 3x4 Link Grid candidate", () => {
    const result = LinkGridPuzzleCandidateSchema.safeParse(
      createCandidate({ groupCount: 3 }),
    );

    expect(result.success).toBe(true);
    expect(result.success && result.data.groups).toHaveLength(3);
  });

  it("accepts a valid 4x4 Link Grid candidate", () => {
    const result = LinkGridPuzzleCandidateSchema.safeParse(
      createCandidate({ groupCount: 4 }),
    );

    expect(result.success).toBe(true);
    expect(result.success && result.data.groups).toHaveLength(4);
  });

  it("rejects unsupported group counts", () => {
    const result = LinkGridPuzzleCandidateSchema.safeParse(
      createCandidate({ groupCount: 2 }),
    );

    expect(result.success).toBe(false);
  });

  it("rejects groups with the wrong item count", () => {
    const candidate = createCandidate({ groupCount: 3 });
    candidate.groups[0].items.pop();

    const result = LinkGridPuzzleCandidateSchema.safeParse(candidate);

    expect(result.success).toBe(false);
  });

  it("rejects duplicate item text", () => {
    const candidate = createCandidate({ groupCount: 3 });
    candidate.groups[1].items[2].text = "  GROUP 1 ITEM 1 ";

    const result = LinkGridPuzzleCandidateSchema.safeParse(candidate);

    expect(result.success).toBe(false);
    expect(result.success ? [] : result.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ["groups", 1, "items", 2, "text"],
        }),
      ]),
    );
  });

  it("rejects empty item text", () => {
    const candidate = createCandidate({ groupCount: 3 });
    candidate.groups[0].items[0].text = " ";

    const result = LinkGridPuzzleCandidateSchema.safeParse(candidate);

    expect(result.success).toBe(false);
  });

  it("rejects missing explanations", () => {
    const candidate = createCandidate({ groupCount: 3 });
    candidate.groups[0].explanation = "";

    const result = LinkGridPuzzleCandidateSchema.safeParse(candidate);

    expect(result.success).toBe(false);
  });

  it("rejects invalid difficulty", () => {
    const candidate = {
      ...createCandidate({ groupCount: 3 }),
      difficulty: "casual",
    };

    const result = LinkGridPuzzleCandidateSchema.safeParse(candidate);

    expect(result.success).toBe(false);
  });
});

function createCandidate({ groupCount }: { groupCount: number }) {
  return {
    title: "Test Link Grid",
    topic: "Testing",
    difficulty: "medium",
    groups: Array.from({ length: groupCount }, (_, groupIndex) => ({
      label: `Group ${groupIndex + 1}`,
      explanation: `Items in group ${groupIndex + 1} share a clear connection.`,
      gentleHint: `Think about group ${groupIndex + 1}.`,
      strongHint: `These belong to group ${groupIndex + 1}.`,
      items: Array.from({ length: 4 }, (_, itemIndex) => ({
        text: `Group ${groupIndex + 1} Item ${itemIndex + 1}`,
      })),
    })),
  };
}
