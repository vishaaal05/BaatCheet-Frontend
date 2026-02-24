import { io, Socket } from 'socket.io-client';
import { SOCKET_BASE_URL } from '../config/env';

let socket: Socket;

export function connectSocket(token: string, userId: number) {
  socket = io(SOCKET_BASE_URL, {
    transports: ['websocket'],
    auth: { token },
  });

  socket.on('connect', () => {
    console.log('SOCKET CONNECTED', socket.id);
    socket.emit('join_user', userId);
  });

  return socket;
}

export function getSocket() {
  return socket;
}
