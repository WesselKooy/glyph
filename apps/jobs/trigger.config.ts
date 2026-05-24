import { defineConfig } from "@trigger.dev/sdk";

const project = process.env.TRIGGER_PROJECT_REF ?? "proj_local";

export default defineConfig({
  project,
  dirs: ["./src/trigger"],
  retries: {
    enabledInDev: false,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1_000,
      maxTimeoutInMs: 10_000,
      factor: 2,
      randomize: true,
    },
  },
  maxDuration: 300,
});
