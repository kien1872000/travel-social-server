import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class AddUsersToRoomDto {
  @IsString()
  @IsNotEmpty()
  chatGoupId: string;
  @IsArray()
  @IsNotEmpty()
  userIds: string[];
}
export class AddUsersToRoomOutput {
  adder: {
    _id: string;
    displayName: string;
  };
  addedUsers: { _id: string; displayName: string }[];
}
