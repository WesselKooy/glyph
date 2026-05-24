import { Module } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { GenerationJobDispatcher } from "./generation-job-dispatcher";
import { GenerationJobsController } from "./generation-jobs.controller";
import { GenerationJobsService } from "./generation-jobs.service";

@Module({
  controllers: [GenerationJobsController],
  providers: [GenerationJobDispatcher, GenerationJobsService, PrismaService],
})
export class GenerationJobsModule {}
