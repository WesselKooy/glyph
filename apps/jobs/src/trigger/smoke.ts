import { task } from "@trigger.dev/sdk";

type SmokePayload = {
  message: string;
  count?: number;
};

export const smokeTestTask = task({
  id: "smoke-test",
  run: async (payload: SmokePayload) => {
    const count = payload.count ?? 1;

    return {
      echoedMessage: payload.message,
      count,
      checksum: `${payload.message}:${count}`,
    };
  },
});
