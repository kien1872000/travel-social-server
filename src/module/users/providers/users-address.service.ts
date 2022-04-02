import { UpdatePlaceDto } from '@dto/place/place.dto';
import { UserProfile } from '@dto/user/userProfile.dto';
import { Address, User, UserDocument } from '@entity/user.entity';
import { MapsHelper } from '@helper/maps.helper';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GoongMapService } from 'src/goong-map/goong-map.service';

@Injectable()
export class UsersAddressService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly goongmapService: GoongMapService,
    private readonly mapsHelpser: MapsHelper,
  ) {}
  public async updateAddress(
    userId: string,
    { placeId }: UpdatePlaceDto,
  ): Promise<UserProfile> {
    try {
      const placeDetail = await this.goongmapService.placeDetail(placeId);
      const address: Address = {
        name: placeDetail.name,
        coordinate: placeDetail.coordinate,
        formattedAddress: placeDetail.formattedAddress,
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
