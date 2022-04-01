export interface ChatMessageInput {
  message: string;
  chatGroupId: string;
}
export interface ChatMessageOutput {
  message: string;
  userId: string;
  displayName: string;
  avatar: string;
  createdAt: Date;
}
export interface InboxOutput {
  userId: string;
  displayName: string;
  avatar: string;
  isCurrentUserMessage: boolean;
  message: string;
  createdAt: string;
}
