import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  GenerationJobStatus,
  PuzzleDifficulty,
  type Prisma,
} from "@prisma/client";
import { PrismaService } from "../database/prisma.service";
import { type CreateGenerationJobRequestDto } from "./dto/create-generation-job-request.dto";
import {
  type CreateGenerationJobResponseDto,
  type GenerationJobStatusResponseDto,
} from "./dto/generation-job-response.dto";
import { GenerationJobDispatcher } from "./generation-job-dispatcher";

const DEFAULT_PROMPT_VERSION = "link-grid-v1";
const DEFAULT_GENERATION_MODEL = "not-configured";

const generationJobSelect = {
  id: true,
  status: true,
  topic: true,
  difficulty: true,
  promptVersion: true,
  model: true,
  puzzleId: true,
  error: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.GenerationJobSelect;

type GenerationJobRecord = Prisma.GenerationJobGetPayload<{
  select: typeof generationJobSelect;
}>;

@Injectable()
export class GenerationJobsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dispatcher: GenerationJobDispatcher,
  ) {}

  async createJob(
    body: CreateGenerationJobRequestDto,
  ): Promise<CreateGenerationJobResponseDto> {
    const input = readCreateGenerationJobInput(body);

    const job = await this.prisma.generationJob.create({
      data: {
        status: GenerationJobStatus.QUEUED,
        topic: input.topic,
        difficulty: input.difficulty,
        promptVersion: getPromptVersion(),
        model: getGenerationModel(),
      },
      select: {
        id: true,
        status: true,
      },
    });

    await this.dispatcher.dispatchQueuedJob({ jobId: job.id });

    return {
      id: job.id,
      status: job.status.toLowerCase(),
    };
  }

  async getJob(jobId: string): Promise<GenerationJobStatusResponseDto> {
    const job = await this.prisma.generationJob.findUnique({
      where: { id: jobId },
      select: generationJobSelect,
    });

    if (!job) {
      throw new NotFoundException(`Generation job ${jobId} was not found.`);
    }

    return toGenerationJobStatusDto(job);
  }
}

type CreateGenerationJobInput = {
  topic: string;
  difficulty: PuzzleDifficulty;
};

const difficultyByDtoValue = {
  easy: PuzzleDifficulty.EASY,
  medium: PuzzleDifficulty.MEDIUM,
  hard: PuzzleDifficulty.HARD,
  evil: PuzzleDifficulty.EVIL,
} satisfies Record<CreateGenerationJobDifficultyDto, PuzzleDifficulty>;

type CreateGenerationJobDifficultyDto = "easy" | "medium" | "hard" | "evil";

function readCreateGenerationJobInput(
  body: CreateGenerationJobRequestDto,
): CreateGenerationJobInput {
  if (!body || typeof body !== "object") {
    throw new BadRequestException("Request body must be an object.");
  }

  return {
    topic: readTopic(body.topic),
    difficulty: readDifficulty(body.difficulty),
  };
}

function readTopic(value: unknown): string {
  if (typeof value !== "string") {
    throw new BadRequestException("topic is required.");
  }

  const topic = value.trim();

  if (topic.length === 0) {
    throw new BadRequestException("topic cannot be empty.");
  }

  if (topic.length > 80) {
    throw new BadRequestException("topic must be 80 characters or less.");
  }

  return topic;
}

function readDifficulty(value: unknown): PuzzleDifficulty {
  if (typeof value !== "string") {
    throw new BadRequestException(
      "difficulty must be one of: easy, medium, hard, evil.",
    );
  }

  const difficultyValue = value.trim().toLowerCase();

  if (!isCreateGenerationJobDifficultyDto(difficultyValue)) {
    throw new BadRequestException(
      "difficulty must be one of: easy, medium, hard, evil.",
    );
  }

  return difficultyByDtoValue[difficultyValue];
}

function isCreateGenerationJobDifficultyDto(
  value: string,
): value is CreateGenerationJobDifficultyDto {
  return (
    value === "easy" ||
    value === "medium" ||
    value === "hard" ||
    value === "evil"
  );
}

function getPromptVersion(): string {
  return readConfiguredValue(
    process.env.GENERATION_PROMPT_VERSION,
    DEFAULT_PROMPT_VERSION,
  );
}

function getGenerationModel(): string {
  return readConfiguredValue(
    process.env.GENERATION_MODEL,
    DEFAULT_GENERATION_MODEL,
  );
}

function readConfiguredValue(value: string | undefined, fallback: string): string {
  const trimmedValue = value?.trim();
  return trimmedValue && trimmedValue.length > 0 ? trimmedValue : fallback;
}

function toGenerationJobStatusDto(
  job: GenerationJobRecord,
): GenerationJobStatusResponseDto {
  return {
    id: job.id,
    status: job.status.toLowerCase(),
    topic: job.topic,
    difficulty: job.difficulty.toLowerCase(),
    promptVersion: job.promptVersion,
    model: job.model,
    puzzleId: job.puzzleId,
    error: job.error,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
  };
}
