import { JwtAuthGuard } from '@auth/jwt-auth.guard';
import { User } from '@decorator/user.decorator';
import { UpdatePlaceDto } from '@dto/place/place.dto';
import { UpdateAddressDto } from '@dto/user/userProfile.dto';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersAddressService } from '@user/providers/users-address.service';

@ApiTags('User')
@ApiBearerAuth()
@Controller('user')
@UseGuards(JwtAuthGuard)
export class UsersAddressController {
  constructor(private usersAddressService: UsersAddressService) {}
  @Post('update-address')
  @ApiBody({ type: UpdateAddressDto })
  @ApiOperation({ description: 'Cập nhật địa chỉ cho user' })
  async updateUserAddress(
    @User() user,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    return this.usersAddressService.updateAddress(user._id, updateAddressDto);
  }
}
