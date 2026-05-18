import { Controller, Get, Param } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { type AdminPuzzleDetailResponseDto } from "./dto/admin-puzzle-detail-response.dto";
import { type AdminPuzzleListResponseDto } from "./dto/admin-puzzle-list-response.dto";

@Controller("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("puzzles")
  async listPuzzles(): Promise<AdminPuzzleListResponseDto> {
    return this.adminService.listPuzzles();
  }

  @Get("puzzles/:id")
  async getPuzzle(
    @Param("id") puzzleId: string,
  ): Promise<AdminPuzzleDetailResponseDto> {
    return this.adminService.getPuzzle(puzzleId);
  }
}
