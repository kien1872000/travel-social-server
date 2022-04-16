export interface RecentChatOutput {
  chatGroupId: string;
  chatId: string;
  chatGroupName: string;
  image: string[];
  isCurrentUserMessage: boolean;
  message: string;
  createdAt: string;
  seen: boolean;
}
