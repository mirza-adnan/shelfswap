import axios from "axios";
import {
  ConversationDTO,
  MessageDTO,
  StartConversationRequest,
  MessageRequest,
} from "./type";

const BASE_URL = "http://localhost:8081/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

export const messagingApi = {
  async startConversation(
    request: StartConversationRequest
  ): Promise<ConversationDTO> {
    const response = await axios.post(
      `${BASE_URL}/messages/conversations`,
      request,
      getAuthHeaders()
    );
    return response.data;
  },

  async getConversations(): Promise<ConversationDTO[]> {
    const response = await axios.get(
      `${BASE_URL}/messages/conversations`,
      getAuthHeaders()
    );
    return response.data;
  },

  async checkExistingConversation(
    otherUserId: string
  ): Promise<ConversationDTO | null> {
    try {
      const response = await axios.get(
        `${BASE_URL}/messages/check-conversation/${otherUserId}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async getReceivedRequests(): Promise<ConversationDTO[]> {
    const response = await axios.get(
      `${BASE_URL}/messages/requests/received`,
      getAuthHeaders()
    );
    return response.data;
  },

  async getSentRequests(): Promise<ConversationDTO[]> {
    const response = await axios.get(
      `${BASE_URL}/messages/requests/sent`,
      getAuthHeaders()
    );
    return response.data;
  },

  async acceptMessageRequest(conversationId: string): Promise<void> {
    await axios.post(
      `${BASE_URL}/messages/requests/${conversationId}/accept`,
      {},
      getAuthHeaders()
    );
  },

  async rejectMessageRequest(conversationId: string): Promise<void> {
    await axios.post(
      `${BASE_URL}/messages/requests/${conversationId}/reject`,
      {},
      getAuthHeaders()
    );
  },

  async sendMessage(
    conversationId: string,
    request: MessageRequest
  ): Promise<MessageDTO> {
    const response = await axios.post(
      `${BASE_URL}/messages/conversations/${conversationId}`,
      request,
      getAuthHeaders()
    );
    return response.data;
  },

  async getConversationMessages(
    conversationId: string,
    page: number = 0,
    size: number = 50
  ): Promise<MessageDTO[]> {
    const response = await axios.get(
      `${BASE_URL}/messages/conversations/${conversationId}?page=${page}&size=${size}`,
      getAuthHeaders()
    );
    return response.data;
  },

  async markMessagesAsRead(conversationId: string): Promise<void> {
    await axios.post(
      `${BASE_URL}/messages/conversations/${conversationId}/read`,
      {},
      getAuthHeaders()
    );
  },
};
