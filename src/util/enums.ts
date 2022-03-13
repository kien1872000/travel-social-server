export enum Mail {
  Confirmation = 'confirmation',
  Resetpassword = 'resetpassword',
}

export enum Privacy {
  Public = 'public',
  Private = 'private',
}

export enum GroupMemberRole {
  Admin = 'admin',
  NormalUser = 'normalUser',
}

export enum File {
  Image = 'image',
  Video = 'video',
  All = 'all',
}

export enum ReactionType {
  Like = 'like',
  Haha = 'haha',
  Love = 'love',
  Sad = 'sad',
  Wow = 'wow',
  Angry = 'angry',
}

export enum ReactionTypeQuery {
  All = 'all',
  Like = 'like',
  Haha = 'haha',
  Love = 'love',
  Sad = 'sad',
  Wow = 'wow',
  Angry = 'angry',
}

export enum SearchTypes {
  All = 'all',
  Users = 'users',
  Posts = 'posts',
  Groups = 'groups',
}
export enum PostLimit {
  Group = 'group',
  Profile = 'profile',
  NewsFeed = 'newsfeed',
}

export enum LocationType {
  Province = 'province',
  District = 'district',
  Ward = 'ward',
}

export enum TypeInformation {
  'socket_id' = 'socket_id',
  'device_id' = 'device_id',
}

export enum Time {
  Week = 'week',
  Month = 'month',
  Year = 'year',
  All = 'all',
}
export enum TimeCheck {
  Day = 'day',
  Week = 'week',
  Month = 'month',
  Year = 'year',
}

export enum NotificationAction {
  Like = 'like',
  Comment = 'comment'
}
