import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
const API = `${API_URL}/chat`;


// GET TOKEN
const getToken = () => {
  return localStorage.getItem("token");
};


// AXIOS AUTH CONFIG
const authConfig = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`
  }
});




// GET MESSAGES
export const getMessages = async (
  conversationId: string
) => {

  const res = await axios.get(
    `${API}/messages/${conversationId}`,
    authConfig()
  );

  return res.data;
};




// GET SUPERADMIN
export const getSuperAdmin =
  async () => {

    const res = await axios.get(
      `${API}/superadmin`,
      authConfig()
    );

    return res.data;
};




// GET ALL ADMINS
export const getAllAdmins =
  async () => {

    const res = await axios.get(
      `${API}/admins`,
      authConfig()
    );

    return res.data;
};




// CREATE CONVERSATION
export const createConversation =
  async (data: any) => {

    const res = await axios.post(
      `${API}/conversation`,
      data,
      authConfig()
    );

    return res.data;
};




// SEND MESSAGE
export const sendMessage =
  async (data: any) => {

    const formData = new FormData();

    Object.keys(data).forEach((key) => {

      if (
        key === "file" &&
        data[key]
      ) {

        formData.append(
          "file",
          data[key]
        );

      } else if (
        data[key] !== undefined
      ) {

        formData.append(
          key,
          data[key]
        );
      }
    });



    const res = await axios.post(
      `${API}/message`,
      formData,
      {
        headers: {
          Authorization:
            `Bearer ${getToken()}`,

          "Content-Type":
            "multipart/form-data",
        },
      }
    );

    return res.data;
};




// DELETE MESSAGE
export const deleteMessage =
  async (messageId: string) => {

    const res = await axios.delete(
      `${API}/message/${messageId}`,
      authConfig()
    );

    return res.data;
};




// REACT TO MESSAGE
export const reactToMessage =
  async (
    messageId: string,
    data: {
      userId: string;
      emoji: string;
    }
  ) => {

    const res = await axios.post(
      `${API}/message/${messageId}/react`,
      data,
      authConfig()
    );

    return res.data;
};




// GET CONVERSATIONS
export const getConversations =
  async (userId: string) => {

    const res = await axios.get(
      `${API}/conversations/${userId}`,
      authConfig()
    );

    return res.data;
};