import { Injectable } from "@nestjs/common";

export type DispatchGenerationJobInput = {
  jobId: string;
};

@Injectable()
export class GenerationJobDispatcher {
  dispatchQueuedJob(input: DispatchGenerationJobInput): Promise<void> {
    // This is the intentional boundary for future Trigger.dev task dispatch.
    void input.jobId;
    return Promise.resolve();
  }
}
