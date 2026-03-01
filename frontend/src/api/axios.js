import axios from "axios";

const api = axios.create({ 
  baseURL: "https://observant-empathy-production-facf.up.railway.app"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers['ngrok-skip-browser-warning'] = 'true';
  return config;
});

export default api;