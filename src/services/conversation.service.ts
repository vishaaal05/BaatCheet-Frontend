import { axiosInstance } from '../api/client';

type Conversation = {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  participants?: Array<{
    id: number;
    name?: string | null;
    avatar?: string | null;
  }>;
  lastMessage?: {
    text?: string | null;
    createdAt?: string;
    senderId?: number;
  };
};

export async function getConversationsService() {
  const response = await axiosInstance.get<Conversation[]>('/conversation');
  return response.data;
}

export async function createPrivateConversationService(otherUserId: number) {
  const response = await axiosInstance.post<Conversation>(
    '/conversation/private',
    {
      userId: otherUserId,
    },
  );
  return response.data;
}
