import { JwtAuthGuard } from '@auth/jwt-auth.guard';
import { User } from '@decorator/user.decorator';
import { AddInterestDto } from '@dto/interest/add-interest.dto';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { InterestsService } from './interests.service';

@Controller('interests')
@ApiTags('Interest')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class InterestsController {
  constructor(private readonly interestsService: InterestsService) {}
  @Post('add')
  @ApiBody({ type: AddInterestDto })
  @ApiOperation({ description: 'thêm lượt quan tâm của user' })
  async addInterest(@Body() { postId }: AddInterestDto, @User() user) {
    return this.interestsService.addInterest(postId, user._id);
  }
}
