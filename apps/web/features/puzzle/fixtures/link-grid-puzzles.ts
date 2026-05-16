import type { LinkGridPuzzle } from "../lib/link-grid";

export const linkGridPuzzles = [
  {
    id: "starter-kitchen-shelf",
    title: "Kitchen Shelf",
    theme: "Everyday food",
    difficulty: "beginner",
    groupSize: 4,
    mistakesAllowed: 4,
    groups: [
      {
        id: "leafy-herbs",
        label: "Leafy herbs",
        explanation:
          "Basil, mint, parsley, and cilantro are fresh herbs commonly used to finish dishes.",
        hints: {
          gentle: "These are usually added for aroma or freshness.",
          strong: "You might find these in a bunch beside the vegetables.",
        },
        items: ["Basil", "Mint", "Parsley", "Cilantro"],
      },
      {
        id: "citrus-fruits",
        label: "Citrus fruits",
        explanation:
          "Lemon, lime, orange, and grapefruit are citrus fruits with bright, acidic juice.",
        hints: {
          gentle: "Think of a sharp, juicy flavor family.",
          strong: "These fruits are often squeezed over food or into drinks.",
        },
        items: ["Lemon", "Lime", "Orange", "Grapefruit"],
      },
      {
        id: "baking-basics",
        label: "Baking basics",
        explanation:
          "Flour, sugar, butter, and eggs are staple ingredients in many cakes and cookies.",
        hints: {
          gentle: "These often come out before the oven turns on.",
          strong: "They are core ingredients for cakes and cookies.",
        },
        items: ["Flour", "Sugar", "Butter", "Eggs"],
      },
    ],
  },
  {
    id: "standard-night-sky",
    title: "Night Sky",
    theme: "Space and weather",
    difficulty: "easy",
    groupSize: 4,
    mistakesAllowed: 4,
    groups: [
      {
        id: "rocky-planets",
        label: "Rocky planets",
        explanation:
          "Mercury, Venus, Earth, and Mars are the four rocky planets in the inner solar system.",
        hints: {
          gentle: "These are neighbors in one part of the solar system.",
          strong: "They are the inner planets with solid surfaces.",
        },
        items: ["Mercury", "Venus", "Earth", "Mars"],
      },
      {
        id: "moon-phases",
        label: "Moon phases",
        explanation:
          "New, crescent, quarter, and gibbous describe visible phases of the Moon.",
        hints: {
          gentle: "These words describe changing shapes in the sky.",
          strong: "They are names used for phases of the Moon.",
        },
        items: ["New", "Crescent", "Quarter", "Gibbous"],
      },
      {
        id: "cloud-types",
        label: "Cloud types",
        explanation:
          "Cumulus, stratus, cirrus, and nimbus are common terms used to classify clouds.",
        hints: {
          gentle: "Look upward, but not quite as far as space.",
          strong: "These are categories of clouds.",
        },
        items: ["Cumulus", "Stratus", "Cirrus", "Nimbus"],
      },
      {
        id: "constellations",
        label: "Constellations",
        explanation:
          "Orion, Lyra, Draco, and Cygnus are recognized constellations in the night sky.",
        hints: {
          gentle: "These are named patterns.",
          strong: "Astronomers use these names for star groupings.",
        },
        items: ["Orion", "Lyra", "Draco", "Cygnus"],
      },
    ],
  },
  {
    id: "standard-wordplay-works",
    title: "Work Bench",
    theme: "Words and objects",
    difficulty: "medium",
    groupSize: 4,
    mistakesAllowed: 4,
    groups: [
      {
        id: "things-with-keys",
        label: "Things with keys",
        explanation:
          "A piano, keyboard, hotel, and map can all have or use keys in different senses.",
        hints: {
          gentle: "The shared word is not always physical.",
          strong: "Each item connects to the word 'key'.",
        },
        items: ["Piano", "Keyboard", "Hotel", "Map"],
      },
      {
        id: "carpentry-tools",
        label: "Carpentry tools",
        explanation:
          "Saw, plane, chisel, and clamp are tools used in woodworking and carpentry.",
        hints: {
          gentle: "These belong near a workbench.",
          strong: "A woodworker would recognize this set.",
        },
        items: ["Saw", "Plane", "Chisel", "Clamp"],
      },
      {
        id: "newspaper-sections",
        label: "Newspaper sections",
        explanation:
          "Sports, opinion, business, and arts are common newspaper or news site sections.",
        hints: {
          gentle: "These organize daily reading.",
          strong: "You might see these as tabs on a news site.",
        },
        items: ["Sports", "Opinion", "Business", "Arts"],
      },
      {
        id: "coffee-orders",
        label: "Coffee orders",
        explanation:
          "Latte, mocha, cortado, and americano are common espresso-based coffee drinks.",
        hints: {
          gentle: "These are ordered by name.",
          strong: "They are drinks built around espresso.",
        },
        items: ["Latte", "Mocha", "Cortado", "Americano"],
      },
    ],
  },
] satisfies readonly LinkGridPuzzle[];

export function getLinkGridPuzzleById(
  puzzleId: string,
): LinkGridPuzzle | undefined {
  return linkGridPuzzles.find((puzzle) => puzzle.id === puzzleId);
}

export const dailyLinkGridPuzzle = linkGridPuzzles[0];
