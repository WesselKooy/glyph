import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { type CreateGenerationJobRequestDto } from "./dto/create-generation-job-request.dto";
import {
  type CreateGenerationJobResponseDto,
  type GenerationJobStatusResponseDto,
} from "./dto/generation-job-response.dto";
import { GenerationJobsService } from "./generation-jobs.service";

@Controller("generation-jobs")
export class GenerationJobsController {
  constructor(private readonly generationJobsService: GenerationJobsService) {}

  @Post()
  async createJob(
    @Body() body: CreateGenerationJobRequestDto,
  ): Promise<CreateGenerationJobResponseDto> {
    return this.generationJobsService.createJob(body);
  }

  @Get(":id")
  async getJob(
    @Param("id") jobId: string,
  ): Promise<GenerationJobStatusResponseDto> {
    return this.generationJobsService.getJob(jobId);
  }
}
