import axios from "axios";

export const api = axios.create({
  baseURL: "https://back.alyoumsa.com/public/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const register = (data) => api.post("/register", data);
export const login = (data) => api.post("/login", data);

export default api;
