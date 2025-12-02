import { io, Socket, type SocketOptions } from 'socket.io-client'

const socketClients = new Map<string, Socket>()

export const disconnectSocketIO = async (wssUrl: string) => {
  const socket = socketClients.get(wssUrl)
  socket?.disconnect()
  socketClients.delete(wssUrl)
}

export async function connectSocketIO(url: string, opts: SocketOptions) {
  if (socketClients.has(url)) return socketClients.get(url) as Socket
  const socket = io(url.trim(), { ...opts })
  await new Promise((resolve, reject) => {
    socket.on('connect_error', (err) => {
      reject(err)
    })
    socket.on('connect', () => {
      resolve(true)
    })
    setTimeout(() => {
      reject(new Error('Cannot establish connection within 5 seconds'))
    }, 5000)
  })
  return socket
}
