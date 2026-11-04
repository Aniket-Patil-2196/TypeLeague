import { io } from 'socket.io-client';

const getSocketUrl = () => {
  const envSocketUrl = import.meta.env.VITE_SOCKET_URL;
  if (envSocketUrl && envSocketUrl.trim()) {
    return envSocketUrl.trim().replace(/\/+$/, '');
  }

  const envApiUrl = import.meta.env.VITE_API_URL;
  if (envApiUrl && envApiUrl.trim() && !envApiUrl.startsWith('/')) {
    return envApiUrl.trim().replace(/\/api\/v1\/?$/, '').replace(/\/+$/, '');
  }

  return 'http://localhost:5000';
};

export const socket = io(getSocketUrl(), {
  autoConnect: false,
  withCredentials: true,
  transports: ['websocket', 'polling'],
});
