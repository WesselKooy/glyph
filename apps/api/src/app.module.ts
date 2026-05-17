import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { appConfig } from "./config/app.config";
import { HealthModule } from "./health/health.module";
import { PuzzlesModule } from "./puzzles/puzzles.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    HealthModule,
    PuzzlesModule,
  ],
})
export class AppModule {}
