import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AdminModule } from "./admin/admin.module";
import { appConfig } from "./config/app.config";
import { GenerationJobsModule } from "./generation-jobs/generation-jobs.module";
import { GameplayModule } from "./gameplay/gameplay.module";
import { HealthModule } from "./health/health.module";
import { PuzzlesModule } from "./puzzles/puzzles.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    AdminModule,
    GenerationJobsModule,
    GameplayModule,
    HealthModule,
    PuzzlesModule,
  ],
})
export class AppModule {}
