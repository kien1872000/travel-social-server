import { ArrayNotEmpty, IsNotEmpty, IsString } from 'class-validator';

export class AddUsersToRoomDto {
  @IsString()
  @IsNotEmpty()
  chatGroupId: string;
  @IsString({ each: true })
  @ArrayNotEmpty()
  userIds: string[];
}
export interface AddUsersToRoomOutput {
  adder: {
    _id: string;
    displayName: string;
  };
  addedUsers: { _id: string; displayName: string }[];
}

export class JoinRoomDto {
  @IsString()
  @IsNotEmpty()
  chatGroupId: string;
}
