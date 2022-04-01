import { UpdatePlaceDto } from '@dto/place/place.dto';
import { UserProfile } from '@dto/user/userProfile.dto';
import { Coordinate } from '@entity/place.entity';
import { Address, User, UserDocument } from '@entity/user.entity';
import { MapsHelper } from '@helper/maps.helper';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class UsersAddressService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly mapsHelpser: MapsHelper,
  ) {}
  public async updateAddress(
    userId: string,
    updatePlaceDto: UpdatePlaceDto,
  ): Promise<UserProfile> {
    try {
      const coordinate: Coordinate = {
        longitude: updatePlaceDto.longitude,
        latitude: updatePlaceDto.latitude,
      };
      const address: Address = {
        name: updatePlaceDto.name,
        coordinate: coordinate,
        formattedAddress: updatePlaceDto.formattedAddress,
      };
      const user = await this.userModel.findByIdAndUpdate(
        userId,
        { address: address },
        {
          new: true,
        },
      );

      return this.mapsHelpser.mapToUserProfile(user, true, false);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
