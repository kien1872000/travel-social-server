import { FollowingsOutput } from 'src/dto/following/following.dto';
import { UserProfile } from 'src/dto/user/userProfile.dto';
import { UserDocument } from 'src/entity/user.entity';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import { VIET_NAM_TZ } from 'src/util/constants';
import { LoginOutput } from 'src/dto/user/login.dto';
// import { PostOutput, Reactions } from 'src/dtos/post/postNew.dto';
import { StringHandlersHelper } from './stringHandler.helper';
import { PostDocument } from 'src/entity/post.entity';
import { MediaFileDocument } from 'src/entity/mediaFile.entity';
import { MediaFileDto } from 'src/dto/mediaFile/mediaFile.dto';
import { GroupDocument } from 'src/entity/group.entity';
import { FollowingDocument } from 'src/entity/following.entity';
export class MapsHelper {
  stringhandlersHelper: StringHandlersHelper;
  constructor() {
    this.stringhandlersHelper = new StringHandlersHelper();
  }
  public mapToLoginOutput(
    accessToken: string,
    refreshToken,
    user: UserProfile,
  ): LoginOutput {
    return {
      refreshToken: refreshToken,
      accessToken: accessToken,
      displayName: user.displayName,
      avatar: user.avatar,
      sex: user.sex,
    };
  }
  public mapToUserProfile(
    user: UserDocument,
    isCurrentUser: boolean,
    isFollowed?: boolean,
  ): UserProfile {
    dayjs.extend(timezone);
    dayjs.extend(utc);
    const birthday = dayjs(user.birthday).tz(VIET_NAM_TZ).format('YYYY-MM-DD');
    const createdAt = dayjs((user as unknown as any).createdAt)
      .tz(VIET_NAM_TZ)
      .format('YYYY-MM-DD');
    let sex = '';
    switch (user.sex) {
      case 0:
        sex = 'Nữ';
        break;
      case 1:
        sex = 'Nam';
        break;
      case 2:
        sex = 'Khác';
        break;
      default:
        break;
    }
    return {
      email: user.email,
      displayName: user.displayName,
      birthday: birthday,
      avatar: user.avatar,
      coverPhoto: user.coverPhoto,
      sex: sex,
      sexNumber: user.sex,
      followers: user.followers,
      followings: user.followings,
      isCurrentUser: isCurrentUser,
      isFollowed,
      createdAt: createdAt,
    };
  }
  public mapToFollowingsOuput(
    followings: UserDocument[] | FollowingDocument[],
    followingIds: string[],
    currentUserId: string,
  ): FollowingsOutput[] {
    return followings.map((i) => {
      const user = (i.user ? i.user : i) as unknown as any;
      return {
        userId: user._id.toHexString(),
        displayName: user.displayName,
        avatar: user.avatar,
        followed: followingIds.includes(user._id.toString()),
        isCurrentUser: currentUserId === user._id.toString(),
      };
    });
  }
  // private getReactions(reactions: Reactions): Reactions {
  //   const reactionsArrTemp = Object.entries<number>(reactions).sort(
  //     (el1, el2) => {
  //       return Number(el2[1]) - Number(el1[1]);
  //     },
  //   );
  //   let total = 0;
  //   const reactionsArr = reactionsArrTemp.map((i) => {
  //     const keySize = i[0].length;
  //     const key = i[0];
  //     if (key[keySize - 1] === 's') i[0] = key.slice(0, keySize - 1);
  //     return i;
  //   });
  //   for (const key in reactions) total += reactions[key];
  //   const result: Reactions = Object.fromEntries<number>(
  //     reactionsArr.slice(0, 3).filter((i) => Number(i[1]) > 0),
  //   );
  //   result.total = total;
  //   return result;
  // }
  // public mapToPostOutPut(post: PostDocument, currentUser: string): PostOutput {
  //   const postId = (post as any)._id;
  //   const user = post.user as any;
  //   const reactions = this.getReactions(post.reactions);

  //   const createdAt = this.stringhandlersHelper.getDateWithTimezone(
  //     String((post as any).createdAt),
  //     VIET_NAM_TZ,
  //   );

  //   const groupId = (post.group as any)?._id;
  //   const groupName = (post.group as unknown as GroupDocument)?.name;
  //   const groupBackgroundImage = (post.group as unknown as GroupDocument)
  //     ?.backgroundImage;
  //   return {
  //     postId: postId,
  //     groupId: groupId?.toString(),
  //     groupBackgroundImage: groupBackgroundImage,
  //     groupName: groupName,
  //     userId: user._id,
  //     userDisplayName: user.displayName,
  //     userAvatar: user.avatar,
  //     description: post.description,
  //     files: post.mediaFiles,
  //     reactions: reactions,
  //     comments: post.comments,
  //     isCurrentUser: user._id.toString() === currentUser,
  //     createdAt: createdAt,
  //   };
  // }
  public mapToMediaFileDto(mediaFile: MediaFileDocument): MediaFileDto {
    const displayName = (mediaFile.user as unknown as UserDocument).displayName;
    const avatar = (mediaFile.user as unknown as UserDocument).avatar;
    const userId = (mediaFile as any).user._id.toString();
    const createdAt = this.stringhandlersHelper.getDateWithTimezone(
      (mediaFile as any).createdAt,
      VIET_NAM_TZ,
    );
    return {
      userId: userId,
      displayName: displayName,
      avatar: avatar,
      des: mediaFile.des,
      url: mediaFile.url,
      type: mediaFile.type,
      groupId: (mediaFile.group as any)?._id,
      groupName: (mediaFile.group as unknown as GroupDocument)?.name,
      groupBackgroundImage: (mediaFile.group as unknown as GroupDocument)
        ?.backgroundImage,

      createdAt: createdAt,
    };
  }
}
