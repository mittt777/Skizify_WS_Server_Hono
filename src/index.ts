import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Socket } from 'socket.io';
import http from 'http';
import { Server } from 'socket.io';
import { UserManager } from './managers/UserManager';

const app = new Hono();

// Enable CORS
app.use('*', cors());

// Parse JSON bodies
app.use('*', async (c, next) => {
  await c.req.parseBody();
  await next();
});

// Middleware for logging
app.use('*', async (c, next) => {
  console.log(`${new Date().toISOString()} - ${c.req.method} ${c.req.url}`);
  console.log('Headers:', c.req.header);
  await next();
});

app.get('/health', (c) => {
  return c.json({ status: 'ok' });
});

const server = http.createServer(async (req, res) => {
  try {
    const response = await app.fetch(req as any, res as any);
    // Assuming app.fetch handles the response
  } catch (error) {
    console.error(error);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
});

const io = new Server(server, {
  cors: {
    origin: '*',
  },
  connectionStateRecovery: {},
});

const userManager = new UserManager();

io.on('connection', (socket: Socket) => {
  console.log('Connection Established');

  socket.emit('debug', {
    message: 'Connected successfully',
    socketId: socket.id,
    transport: socket.conn.transport.name,
  });

  socket.on(
    'sessiondetails',
    ({ userId, meetingId }: { userId: string; meetingId: string }) => {
      console.log('We are creating room');
      console.log('User Joined the RoomId', meetingId);
      userManager.createRoom(userId, meetingId, socket, io);

      socket.on('disconnect', () => {
        console.log('User disconnected');
        userManager.removeUser(meetingId, userId);
      });
    }
  );
});

const PORT = 80;

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
