import { Controller, Get } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { type AdminPuzzleListResponseDto } from "./dto/admin-puzzle-list-response.dto";

@Controller("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("puzzles")
  async listPuzzles(): Promise<AdminPuzzleListResponseDto> {
    return this.adminService.listPuzzles();
  }
}
