import { JwtAuthGuard } from '@auth/jwt-auth.guard';
import { Controller, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SearchsService } from './searchs.service';

@Controller('searchs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Search')
export class SearchsController {
  constructor(private searchsService: SearchsService) {}
}
