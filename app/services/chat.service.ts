import api from './api';

const API = '/chat';

// GET MESSAGES
export const getMessages = async (
  conversationId: string
) => {
  const res = await api.get(`${API}/messages/${conversationId}`);
  return res.data;
};

// GET SUPERADMIN
export const getSuperAdmin =
  async () => {
    const res = await api.get(`${API}/superadmin`);
    return res.data;
};

// GET ALL ADMINS
export const getAllAdmins = async () => {
  const res = await api.get(`${API}/admins`);
  return res.data;
};

// CREATE CONVERSATION
export const createConversation = async (data: {
  type: string;
  participants: string[];
  createdBy: string;
}) => {
  const res = await api.post(`${API}/conversation`, data);
  return res.data;
};

// SEND MESSAGE
export const sendMessage = async (formData: FormData) => {
  const res = await api.post(`${API}/message`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

// GET USER CONVERSATIONS
export const getConversations = async (userId: string) => {
  const res = await api.get(`${API}/conversations/${userId}`);
  return res.data;
};

// DELETE MESSAGE
export const deleteMessage = async (messageId: string) => {
  const res = await api.delete(`${API}/message/${messageId}`);
  return res.data;
};

// REACT TO MESSAGE
export const reactToMessage = async (messageId: string, reaction: { userId: string; emoji: string }) => {
  const res = await api.post(`${API}/message/${messageId}/react`, reaction);
  return res.data;
};