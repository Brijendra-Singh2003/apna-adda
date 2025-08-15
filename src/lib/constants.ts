import axios from "axios";

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3000";
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? "ws://localhost:3000";

export const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
});