const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
console.log("BASE_URL:", process.env.NEXT_PUBLIC_API_URL);
const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

export const apiRequest = async (endpoint, method = "GET", body = null) => {
  const token = getToken();

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...(body && { body: JSON.stringify(body) }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "API Error");
  }

  return data;
};