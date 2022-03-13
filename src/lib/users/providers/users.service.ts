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
} from 'src/dto/user/userProfile.dto';
import { UserSignUp } from 'src/dto/user/userSignup.dto';
import { User, UserDocument } from 'src/entity/user.entity';
import * as bcrypt from 'bcrypt';
import { ChangePasswordInput } from 'src/dto/user/changePassword.dto';
import { SEARCH_USER_PER_PAGE } from 'src/util/constants';
import { MapsHelper } from 'src/helper/maps.helper';
import { StringHandlersHelper } from 'src/helper/stringHandler.helper';
import { MediaFilesService } from 'src/lib/mediaFiles/mediaFiles.service';
import { FollowingsOutput } from 'src/dto/following/following.dto';
import { FollowingsService } from 'src/lib/followings/providers/followings.service';
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
  public async addNewUser(user: UserSignUp): Promise<void> {
    try {
      const newUser: Partial<UserDocument> = {
        email: user.email,
        password: user.password,
        displayName: user.displayName,
        displayNameNoAccent: this.stringHandlers.removeAccent(user.displayName),
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
          throw new BadRequestException('Mật khẩu hiên tại không đúng');
        } else {
          console.log('hello');
        }
      } else throw new BadRequestException('Tài khoản không tồn tại');
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
      const sex = userInfoInput.sex;
      const birthday = userInfoInput.birthday;
      const user = await this.userModel.findByIdAndUpdate(
        userId,
        {
          birthday: new Date(birthday),
          sex: sex,
        },
        { new: true },
      );
      return this.mapsHelper.mapToUserProfile(user, true);
    } catch (error) {
      console.log(error);
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
            'Ảnh bìa',
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
            'Ảnh đại diện',
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
            'Ảnh bìa',
            userId.toString(),
          ),
          this.mediaFilesService.saveFile(
            avatar,
            avatarPath,
            'Ảnh đại diện',
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
  public async getUserSearchList(
    userId: string,
    search: string,
    pageNumber: number,
  ): Promise<FollowingsOutput[]> {
    search = this.stringHandlers.removeAccent(search.trim());
    if (!search) return [];
    let limit = SEARCH_USER_PER_PAGE;
    let skip = !pageNumber || pageNumber <= 0 ? 0 : pageNumber * limit;
    const globalRegex = new RegExp(
      '(^' + search + ')' + '|' + '( +' + search + '[a-zA-z]*' + ')',
      'i',
    );
    const followingIds = await this.followingsService.getFollowingIds(userId);
    let followings: UserDocument[] = [];
    if (skip < followingIds.length) {
      followings = await this.userModel
        .find({
          displayNameNoAccent: { $regex: globalRegex },
          _id: { $in: followingIds },
        })
        .sort({ displayNameNoAccent: 1 })
        .select(['displayName', 'avatar'])
        .skip(skip)
        .limit(limit);

      if (followings.length < limit) {
        skip = 0;
        limit = limit - followings.length;
      } else {
        return this.mapsHelper.mapToFollowingsOuput(
          followings,
          followingIds,
          userId,
        );
      }
    }
    const rest = await this.userModel
      .find({
        displayNameNoAccent: { $regex: globalRegex },
        _id: { $nin: followingIds },
      })
      .sort({ displayNameNoAccent: 1 })
      .select(['displayName', 'avatar'])
      .skip(skip)
      .limit(limit);
    const result = followings.concat(rest);
    return this.mapsHelper.mapToFollowingsOuput(result, followingIds, userId);
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
}
