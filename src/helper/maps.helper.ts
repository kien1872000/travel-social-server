import { FollowingsOutput } from 'src/dto/following/following.dto';
import { UserProfile } from 'src/dto/user/userProfile.dto';
import { UserDocument } from 'src/entity/user.entity';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import { VIET_NAM_TZ } from '@util/constants';
import { LoginOutput } from '@dto/user/login.dto';
import { StringHandlersHelper } from './string-handler.helper';
import { PostDocument } from '@entity/post.entity';
import { MediaFileDocument } from '@entity/mediaFile.entity';
import { MediaFileDto } from '@dto/media-file/media-file.dto';
import { GroupDocument } from '@entity/group.entity';
import { FollowingDocument } from '@entity/following.entity';
import { PostOutput } from '@dto/post/post-new.dto';
import { CommentDocument } from '@entity/comment.entity';
import { UserCommentDto } from '@dto/comment/user-comment.dto';
import { RecentChatDocument } from '@entity/recent-chat.entity';
import { RecentChatOutput } from '@dto/chat/recent-chat.dto';
import { ChatDocument } from '@entity/chat.entity';
import { InboxOutput } from '@dto/chat/chat.dto';
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
      renamableTime: user.renamableTime,
      birthday: birthday,
      avatar: user.avatar,
      coverPhoto: user.coverPhoto,
      bio: user.bio,
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
      let user = (i.user ? i.user : i) as unknown as any;
      if (!user.displayName)
        user = (i.following ? i.following : i) as unknown as any;
      return {
        userId: user._id,
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
  public mapToPostOutPut(
    post: PostDocument,
    currentUser: string,
    liked: boolean,
  ): PostOutput {
    const postId = (post as any)._id;
    const user = post.user as any;

    const createdAt = this.stringhandlersHelper.getDateWithTimezone(
      String((post as any).createdAt),
      VIET_NAM_TZ,
    );

    const groupId = (post.group as any)?._id;
    const groupName = (post.group as unknown as GroupDocument)?.name;
    const groupBackgroundImage = (post.group as unknown as GroupDocument)
      ?.backgroundImage;
    return {
      liked: liked,
      postId: postId,
      groupId: groupId?.toString(),
      groupBackgroundImage: groupBackgroundImage,
      groupName: groupName,
      userId: user._id,
      userDisplayName: user.displayName,
      userAvatar: user.avatar,
      description: post.description,
      files: post.mediaFiles,
      likes: post.likes,
      comments: post.comments,
      isCurrentUser: user._id.toString() === currentUser,
      createdAt: createdAt,
    };
  }
  public mapToUserCommentDto(
    comment: CommentDocument | CommentDocument[],
  ): UserCommentDto {
    const cmt = comment as unknown as CommentDocument;
    const user = cmt.userId as any;
    return {
      commentId: (cmt as any)._id,
      comment: cmt.comment,
      userId: user._id,
      displayName: user.displayName,
      avatar: user.avatar,
      replys: cmt.replys,
      createdAt: (cmt as any).createdAt,
    };
  }
  public mapToRecentChatOutput(
    currentUser: string,
    recentChat: RecentChatDocument,
  ): RecentChatOutput {
    const chat = recentChat.chat as unknown as ChatDocument;
    const participants = recentChat.participants.filter(
      (i) => (i as any)._id.toString() !== currentUser,
    );

    const partner =
      participants.length > 0 ? participants[0] : recentChat.participants[0];
    return {
      partnerId: (partner as any)._id.toString(),
      displayName: (partner as unknown as UserDocument).displayName,
      avatar: (partner as unknown as UserDocument).avatar,
      isCurrentUserMessage: chat.owner.toString() === currentUser,
      message: chat.message,
      createdAt: (chat as any).createdAt,
      seen: chat.seen,
    };
  }
  public mapToInboxOutput(
    currentUser: string,
    inbox: ChatDocument,
    seen: boolean,
  ): InboxOutput {
    return {
      userId: (inbox.owner as any)._id.toString(),
      displayName: (inbox.owner as unknown as UserDocument).displayName,
      avatar: (inbox.owner as unknown as UserDocument).avatar,
      isCurrentUserMessage: (inbox.owner as any)._id.toString() === currentUser,
      message: inbox.message,
      createdAt: (inbox as any).createdAt,
      seen: seen,
    };
  }
}
