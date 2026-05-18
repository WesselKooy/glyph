import { Module } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { PuzzlesController } from "./puzzles.controller";
import { PuzzlesService } from "./puzzles.service";

@Module({
  controllers: [PuzzlesController],
  providers: [PrismaService, PuzzlesService],
})
export class PuzzlesModule {}
