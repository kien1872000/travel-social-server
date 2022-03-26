export class ChatMessageInput {
  room: string;
  message: string;
  partnerId: string;
}
export class ChatMessageOutput {
  message: string;
  sender: {
    _id: string;
    displayName: string;
    avatar: string;
  };
  receiver: {
    _id: string;
    displayName: string;
    avatar: string;
  };
}
export class InboxOutput {
  userId: string;
  displayName: string;
  avatar: string;
  isCurrentUserMessage: boolean;
  message: string;
  createdAt: string;
  seen: boolean;
}
