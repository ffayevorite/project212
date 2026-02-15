import axios from "axios";

const API_URL = "http://localhost:8000/api/auth";

export const login = async (email, password) => {
  try {
    const response = await axios.post("http://localhost:8000/api/auth/login", {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || "Login failed";
  }
};
