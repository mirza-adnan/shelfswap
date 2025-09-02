export type BookAddRequest = {
  id: string;
  title: string;
  author: string;
  coverId?: number;
};

export type BookResponse = {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
};

export type UserDTO = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

export type ConversationDTO = {
  id: string;
  initiator: UserDTO;
  recipient: UserDTO;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  introductoryMessage: string | null;
  createdAt: string;
  lastMessageAt: string;
  lastMessage: string | null;
  unreadMessageCount: number;
};

export type MessageDTO = {
  id: string;
  conversationId: string;
  sender: UserDTO;
  content: string;
  sentAt: string;
  isRead: boolean;
};

export type StartConversationRequest = {
  recipientId: string;
  initialMessage: string;
};

export type MessageRequest = {
  content: string;
};
