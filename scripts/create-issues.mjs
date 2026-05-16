import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const file = process.argv[2];

if (!file) {
  console.error("Usage: node scripts/create-issues.mjs tickets/m1-playable-prototype.json");
  process.exit(1);
}

let tickets;

try {
  tickets = JSON.parse(readFileSync(file, "utf8"));
} catch (error) {
  console.error(`Failed to read ticket file: ${file}`);
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

if (!Array.isArray(tickets)) {
  console.error("Ticket file must contain a JSON array.");
  process.exit(1);
}

for (const [index, ticket] of tickets.entries()) {
  if (!ticket || typeof ticket !== "object") {
    console.error(`Ticket at index ${index} must be an object.`);
    process.exit(1);
  }

  if (typeof ticket.title !== "string" || ticket.title.trim() === "") {
    console.error(`Ticket at index ${index} is missing a title.`);
    process.exit(1);
  }

  if (typeof ticket.body !== "string" || ticket.body.trim() === "") {
    console.error(`Ticket at index ${index} is missing a body.`);
    process.exit(1);
  }

  const args = [
    "issue",
    "create",
    "--title",
    ticket.title,
    "--body",
    ticket.body,
  ];

  if (ticket.labels !== undefined && !Array.isArray(ticket.labels)) {
    console.error(`Ticket "${ticket.title}" has labels, but labels is not an array.`);
    process.exit(1);
  }

  for (const label of ticket.labels ?? []) {
    if (typeof label !== "string" || label.trim() === "") {
      console.error(`Ticket "${ticket.title}" has an invalid label.`);
      process.exit(1);
    }

    args.push("--label", label);
  }

  console.log(`Creating issue: ${ticket.title}`);

  const result = spawnSync("gh", args, {
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    console.error(`Failed to create issue: ${ticket.title}`);
    process.exit(result.status ?? 1);
  }
}
