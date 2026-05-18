import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { type CreateAdminPuzzleRequestDto } from "./dto/create-admin-puzzle-request.dto";
import { type AdminPuzzleDetailResponseDto } from "./dto/admin-puzzle-detail-response.dto";
import { type AdminPuzzleListResponseDto } from "./dto/admin-puzzle-list-response.dto";

@Controller("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("puzzles")
  async listPuzzles(): Promise<AdminPuzzleListResponseDto> {
    return this.adminService.listPuzzles();
  }

  @Post("puzzles")
  async createPuzzle(
    @Body() body: CreateAdminPuzzleRequestDto,
  ): Promise<AdminPuzzleDetailResponseDto> {
    return this.adminService.createPuzzle(body);
  }

  @Get("puzzles/:id")
  async getPuzzle(
    @Param("id") puzzleId: string,
  ): Promise<AdminPuzzleDetailResponseDto> {
    return this.adminService.getPuzzle(puzzleId);
  }
}
