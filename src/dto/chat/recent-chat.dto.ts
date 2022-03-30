export class RecentChatOutput {
  chatGroupId: string;
  chatId: string;
  chatGroupName: string;
  image: string | string[];
  isCurrentUserMessage: boolean;
  message: string;
  createdAt: string;
  seen: boolean;
}
