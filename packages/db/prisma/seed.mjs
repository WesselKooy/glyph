import { createHash } from "node:crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const linkGridPuzzles = [
  {
    id: "starter-kitchen-shelf",
    title: "Kitchen Shelf",
    theme: "Everyday food",
    difficulty: "EASY",
    groupSize: 4,
    mistakeLimit: 4,
    groups: [
      {
        id: "leafy-herbs",
        label: "Leafy herbs",
        explanation:
          "Basil, mint, parsley, and cilantro are fresh herbs commonly used to finish dishes.",
        gentleHint: "These are usually added for aroma or freshness.",
        strongHint: "You might find these in a bunch beside the vegetables.",
        items: ["Basil", "Mint", "Parsley", "Cilantro"],
      },
      {
        id: "citrus-fruits",
        label: "Citrus fruits",
        explanation:
          "Lemon, lime, orange, and grapefruit are citrus fruits with bright, acidic juice.",
        gentleHint: "Think of a sharp, juicy flavor family.",
        strongHint: "These fruits are often squeezed over food or into drinks.",
        items: ["Lemon", "Lime", "Orange", "Grapefruit"],
      },
      {
        id: "baking-basics",
        label: "Baking basics",
        explanation:
          "Flour, sugar, butter, and eggs are staple ingredients in many cakes and cookies.",
        gentleHint: "These often come out before the oven turns on.",
        strongHint: "They are core ingredients for cakes and cookies.",
        items: ["Flour", "Sugar", "Butter", "Eggs"],
      },
    ],
  },
  {
    id: "standard-night-sky",
    title: "Night Sky",
    theme: "Space and weather",
    difficulty: "EASY",
    groupSize: 4,
    mistakeLimit: 4,
    groups: [
      {
        id: "rocky-planets",
        label: "Rocky planets",
        explanation:
          "Mercury, Venus, Earth, and Mars are the four rocky planets in the inner solar system.",
        gentleHint: "These are neighbors in one part of the solar system.",
        strongHint: "They are the inner planets with solid surfaces.",
        items: ["Mercury", "Venus", "Earth", "Mars"],
      },
      {
        id: "moon-phases",
        label: "Moon phases",
        explanation:
          "New, crescent, quarter, and gibbous describe visible phases of the Moon.",
        gentleHint: "These words describe changing shapes in the sky.",
        strongHint: "They are names used for phases of the Moon.",
        items: ["New", "Crescent", "Quarter", "Gibbous"],
      },
      {
        id: "cloud-types",
        label: "Cloud types",
        explanation:
          "Cumulus, stratus, cirrus, and nimbus are common terms used to classify clouds.",
        gentleHint: "Look upward, but not quite as far as space.",
        strongHint: "These are categories of clouds.",
        items: ["Cumulus", "Stratus", "Cirrus", "Nimbus"],
      },
      {
        id: "constellations",
        label: "Constellations",
        explanation:
          "Orion, Lyra, Draco, and Cygnus are recognized constellations in the night sky.",
        gentleHint: "These are named patterns.",
        strongHint: "Astronomers use these names for star groupings.",
        items: ["Orion", "Lyra", "Draco", "Cygnus"],
      },
    ],
  },
  {
    id: "standard-wordplay-works",
    title: "Work Bench",
    theme: "Words and objects",
    difficulty: "MEDIUM",
    groupSize: 4,
    mistakeLimit: 4,
    groups: [
      {
        id: "things-with-keys",
        label: "Things with keys",
        explanation:
          "A piano, keyboard, hotel, and map can all have or use keys in different senses.",
        gentleHint: "The shared word is not always physical.",
        strongHint: "Each item connects to the word 'key'.",
        items: ["Piano", "Keyboard", "Hotel", "Map"],
      },
      {
        id: "carpentry-tools",
        label: "Carpentry tools",
        explanation:
          "Saw, plane, chisel, and clamp are tools used in woodworking and carpentry.",
        gentleHint: "These belong near a workbench.",
        strongHint: "A woodworker would recognize this set.",
        items: ["Saw", "Plane", "Chisel", "Clamp"],
      },
      {
        id: "newspaper-sections",
        label: "Newspaper sections",
        explanation:
          "Sports, opinion, business, and arts are common newspaper or news site sections.",
        gentleHint: "These organize daily reading.",
        strongHint: "You might see these as tabs on a news site.",
        items: ["Sports", "Opinion", "Business", "Arts"],
      },
      {
        id: "coffee-orders",
        label: "Coffee orders",
        explanation:
          "Latte, mocha, cortado, and americano are common espresso-based coffee drinks.",
        gentleHint: "These are ordered by name.",
        strongHint: "They are drinks built around espresso.",
        items: ["Latte", "Mocha", "Cortado", "Americano"],
      },
    ],
  },
];

async function main() {
  for (const puzzle of linkGridPuzzles) {
    const puzzleId = fixtureUuid(`puzzle:${puzzle.id}`);
    const publishedAt = new Date("2026-01-01T00:00:00.000Z");

    await prisma.puzzle.upsert({
      where: { id: puzzleId },
      create: {
        id: puzzleId,
        title: puzzle.title,
        theme: puzzle.theme,
        type: "LINK_GRID",
        status: "PUBLISHED",
        source: "MANUAL",
        difficulty: puzzle.difficulty,
        groupSize: puzzle.groupSize,
        mistakeLimit: puzzle.mistakeLimit,
        publishedAt,
      },
      update: {
        title: puzzle.title,
        theme: puzzle.theme,
        type: "LINK_GRID",
        status: "PUBLISHED",
        source: "MANUAL",
        difficulty: puzzle.difficulty,
        groupSize: puzzle.groupSize,
        mistakeLimit: puzzle.mistakeLimit,
        publishedAt,
      },
    });

    for (const [groupIndex, group] of puzzle.groups.entries()) {
      const groupId = fixtureUuid(`puzzle:${puzzle.id}:group:${group.id}`);

      await prisma.puzzleGroup.upsert({
        where: { id: groupId },
        create: {
          id: groupId,
          puzzleId,
          label: group.label,
          explanation: group.explanation,
          gentleHint: group.gentleHint,
          strongHint: group.strongHint,
          sortOrder: groupIndex,
        },
        update: {
          puzzleId,
          label: group.label,
          explanation: group.explanation,
          gentleHint: group.gentleHint,
          strongHint: group.strongHint,
          sortOrder: groupIndex,
        },
      });

      for (const [itemIndex, text] of group.items.entries()) {
        const itemId = fixtureUuid(
          `puzzle:${puzzle.id}:group:${group.id}:item:${itemIndex}`,
        );

        await prisma.puzzleItem.upsert({
          where: { id: itemId },
          create: {
            id: itemId,
            puzzleId,
            groupId,
            text,
            sortOrder: itemIndex,
          },
          update: {
            puzzleId,
            groupId,
            text,
            sortOrder: itemIndex,
          },
        });
      }
    }
  }

  console.log(`Seeded ${linkGridPuzzles.length} manual Link Grid puzzles.`);
}

function fixtureUuid(input) {
  const hash = createHash("sha1").update(input).digest();

  hash[6] = (hash[6] & 0x0f) | 0x50;
  hash[8] = (hash[8] & 0x3f) | 0x80;

  const hex = hash.subarray(0, 16).toString("hex");

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join("-");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
