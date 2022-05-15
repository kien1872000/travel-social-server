import { ChatGroupDocument } from '@entity/chat-group.entity';
import { ArrayNotEmpty, IsNotEmpty, IsString } from 'class-validator';
import { ChatGroupOutput } from './chat-group.dto';

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
  newChatGroup: ChatGroupOutput;
}

export class JoinRoomDto {
  @IsString()
  @IsNotEmpty()
  chatGroupId: string;
}
