import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ProfileImageOutPut,
  UserInfoInput,
  UserProfile,
} from '@dto/user/userProfile.dto';
import { UserSignUp } from '@dto/user/userSignup.dto';
import { User, UserDocument } from '@entity/user.entity';
import * as bcrypt from 'bcrypt';
import { ChangePasswordInput } from '@dto/user/changePassword.dto';
import { RENAMABLE_TIME } from '@util/constants';
import { MapsHelper } from '@helper/maps.helper';
import { StringHandlersHelper } from '@helper/string-handler.helper';
import { MediaFilesService } from '@mediaFile/media-files.service';
import { FollowingsService } from '@following/providers/followings.service';
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly mapsHelper: MapsHelper,
    private readonly stringHandlers: StringHandlersHelper,
    private readonly mediaFilesService: MediaFilesService,
    private readonly followingsService: FollowingsService,
  ) {}
  public async findUserById(id: string): Promise<UserDocument> {
    try {
      return await this.userModel.findById(id);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async findUserByManyId(
    listId: Types.ObjectId[],
  ): Promise<UserDocument[]> {
    try {
      return await this.userModel.find({
        _id: {
          $in: listId,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async findUserByMail(email: string): Promise<UserDocument> {
    try {
      return await this.userModel.findOne({ email: email });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async findUserByWalletAddress(
    email: string,
    walletAddress: string,
  ): Promise<UserDocument> {
    try {
      return await this.userModel.findOne({
        email: email,
        walletAddress,
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async findUserByMailAndUpdateAddress(
    email: string,
    walletAddress: string,
  ): Promise<UserDocument> {
    try {
      return await this.userModel.findOneAndUpdate(
        { email: email },
        { walletAddress },
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async addNewUser(user: UserSignUp): Promise<void> {
    try {
      const newUser: Partial<UserDocument> = {
        email: user.email,
        password: user.password,
        displayName: user.displayName,
        displayNameNoAccent: this.stringHandlers.removeAccent(user.displayName),
        renamableTime: new Date(),
        isActive: false,
        avatar: '',
        coverPhoto: '',
        followers: 0,
        followings: 0,
      };
      await new this.userModel(newUser).save();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async getUserProfile(
    currentUserId: string,
    userId: string,
  ): Promise<UserProfile> {
    try {
      userId = userId.trim();
      const user = await this.userModel
        .findById(userId)
        .select(['-password', '-__v', '-refreshToken', '-refreshTokenExpires']);
      const checkFollowed = await this.followingsService.checkIfFollowed(
        currentUserId.toString(),
        userId,
      );
      return this.mapsHelper.mapToUserProfile(
        user,
        currentUserId === userId,
        checkFollowed !== null,
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async activateAccount(email: string): Promise<void> {
    try {
      await this.userModel.findOneAndUpdate(
        { email: email },
        { isActive: true },
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async changePassword(
    userId: string,
    newPassword: string,
  ): Promise<void> {
    try {
      const salt = await bcrypt.genSalt();
      const hash = await bcrypt.hash(newPassword, salt);
      await this.userModel.findByIdAndUpdate(userId, { password: hash });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async updateNewPassword(
    userId: string,
    changePasswordInput: ChangePasswordInput,
  ): Promise<void> {
    try {
      const user = await this.userModel.findById(userId);
      if (user) {
        if (
          !(await bcrypt.compare(
            changePasswordInput.currentPassword,
            user.password,
          ))
        ) {
          throw new BadRequestException('M???t kh???u hi??n t???i kh??ng ????ng');
        } else {
          console.log('hello');
        }
      } else throw new BadRequestException('T??i kho???n kh??ng t???n t???i');
      const salt = await bcrypt.genSalt();
      const hash = await bcrypt.hash(changePasswordInput.newPassword, salt);
      await this.userModel.findByIdAndUpdate(userId, { password: hash });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async updateInfo(
    userId: string,
    userInfoInput: UserInfoInput,
  ): Promise<UserProfile> {
    if (!userInfoInput) return;
    try {
      const user = await this.userModel.findById(userId);
      if (!user) return;
      let update = {
        bio: userInfoInput.bio,
        birthday: new Date(userInfoInput.birthday),
        sex: userInfoInput.sex,
      };
      if (
        userInfoInput.displayName &&
        userInfoInput.displayName.trim().length > 0
      ) {
        if (new Date() <= user.renamableTime) {
          throw new BadRequestException(
            'display name can only be changed after 30 days',
          );
        }
        const temp = {
          displayName: userInfoInput.displayName.trim(),
          displayNameNoAccent: this.stringHandlers.removeAccent(
            userInfoInput.displayName.trim(),
          ),
          renamableTime: new Date().setDate(
            new Date().getDate() + RENAMABLE_TIME,
          ),
        };
        update = { ...update, ...temp };
      }
      const result = await this.userModel.findByIdAndUpdate(userId, update, {
        new: true,
      });
      return this.mapsHelper.mapToUserProfile(result, true);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async updateProfileImage(
    userId: Types.ObjectId,
    avatar: Express.Multer.File,
    coverPhoto: Express.Multer.File,
  ): Promise<ProfileImageOutPut> {
    try {
      let coverPhotoUrl = '';
      let avatarUrl = '';
      const coverPhotoPath = `images/coverPhoto/${userId}${this.stringHandlers.generateString(
        15,
      )}`;
      const avatarPath = `images/avatar/${userId}${this.stringHandlers.generateString(
        15,
      )}`;
      if (!avatar && coverPhoto) {
        coverPhotoUrl = (
          await this.mediaFilesService.saveFile(
            coverPhoto,
            coverPhotoPath,
            '???nh b??a',
            userId.toString(),
          )
        ).url;
        await this.userModel.findByIdAndUpdate(
          userId,
          { coverPhoto: coverPhotoUrl },
          { upsert: true },
        );
      } else if (avatar && !coverPhoto) {
        avatarUrl = (
          await this.mediaFilesService.saveFile(
            avatar,
            avatarPath,
            '???nh ?????i di???n',
            userId.toString(),
          )
        ).url;

        await this.userModel.findByIdAndUpdate(
          userId,
          { avatar: avatarUrl },
          { upsert: true },
        );
      } else if (avatar && coverPhoto) {
        const promises = await Promise.all([
          this.mediaFilesService.saveFile(
            coverPhoto,
            coverPhotoPath,
            '???nh b??a',
            userId.toString(),
          ),
          this.mediaFilesService.saveFile(
            avatar,
            avatarPath,
            '???nh ?????i di???n',
            userId.toString(),
          ),
        ]);
        coverPhotoUrl = promises[0].url;
        avatarUrl = promises[1].url;
        await Promise.all([
          this.userModel.findByIdAndUpdate(
            userId,
            { coverPhoto: coverPhotoUrl },
            { upsert: true },
          ),
          this.userModel.findByIdAndUpdate(
            userId,
            { avatar: avatarUrl },
            { upsert: true },
          ),
        ]);
      }
      return {
        avatar: avatarUrl,
        coverPhoto: coverPhotoUrl,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateFollowers(
    userId: Types.ObjectId,
    update: number,
  ): Promise<void> {
    try {
      await this.userModel.findByIdAndUpdate(userId, {
        $inc: { followers: update },
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async updateFollowings(
    userId: Types.ObjectId,
    update: number,
  ): Promise<void> {
    try {
      await this.userModel.findByIdAndUpdate(userId, {
        $inc: { followings: update },
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async updateRefreshToke(
    refreshToken: string,
    userId: string,
    refreshTokenExpires: Date,
  ): Promise<void> {
    try {
      await this.userModel.findByIdAndUpdate(
        userId,
        {
          refreshToken: refreshToken,
          refreshTokenExpires: refreshTokenExpires,
        },
        { upsert: true },
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async getUserAvatars(users: string[]): Promise<string[]> {
    try {
      const userAvatars = await this.userModel
        .find({
          _id: { $in: users.map((i) => Types.ObjectId(i)) },
        })
        .select('avatar');
      return userAvatars.map((i) => i.avatar);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async getUsers(users: string[]): Promise<UserDocument[]> {
    try {
      return await this.userModel
        .find({
          _id: { $in: users.map((i) => Types.ObjectId(i)) },
        })
        .select('displayName');
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
