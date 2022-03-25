export class ChatMessageInput {
  room: string;
  message: string;
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
