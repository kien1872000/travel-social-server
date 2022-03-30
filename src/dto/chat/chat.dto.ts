export class ChatMessageInput {
  message: string;
  chatGroupId: string;
}
export class ChatMessageOutput {
  message: string;
  userId: string;
  displayName: string;
  avatar: string;
  createdAt: Date;
}
export class InboxOutput {
  userId: string;
  displayName: string;
  avatar: string;
  isCurrentUserMessage: boolean;
  message: string;
  createdAt: string;
}
