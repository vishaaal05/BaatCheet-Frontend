import { axiosInstance } from '../api/client';

type SendMessageParams = {
  conversationId: number;
  text: string;
  clientId: string;
};

type Message = {
  id: number;
  conversationId: number;
  senderId: number;
  text: string | null;
  type: string;
  clientId?: string | null;
  createdAt: string;
  sender?: {
    id: number;
    name: string | null;
    avatar: string | null;
  };
};

export async function getMessagesService(conversationId: number) {
  const response = await axiosInstance.get<Message[]>(
    `/message/${conversationId}`,
  );
  return response.data;
}

export async function sendMessageService(params: SendMessageParams) {
  const response = await axiosInstance.post<Message>('/message/send', params);
  return response.data;
}

export async function markReadService(conversationId: number) {
  const response = await axiosInstance.post(`/message/${conversationId}/read`);
  return response.data;
}
