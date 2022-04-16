import { IsNotEmpty, IsString } from 'class-validator';

export class ChatMessageInput {
  @IsString()
  @IsNotEmpty()
  message: string;
  @IsString()
  @IsNotEmpty()
  chatGroupId: string;
}
export interface ChatMessageOutput {
  message: string;
  userId: string;
  displayName: string;
  avatar: string;
  createdAt: Date;
  isCurrentUserMessage: boolean;
}
export interface InboxOutput {
  userId: string;
  displayName: string;
  avatar: string;
  isCurrentUserMessage: boolean;
  message: string;
  createdAt: string;
}
