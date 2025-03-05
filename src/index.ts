// server
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
const app = new Hono();

app.get('/', (c) => {
  return c.text('Hello Hono!');
});

const server = serve(
  {
    fetch: app.fetch,
    port: 8080,
  },
  (info) => {
    console.log(`Server is running: http://${info.address}:${info.port}`);
  }
);

const ioServer = new Server(server as HttpServer, {
  path: '/ws',
  serveClient: false,
});
ioServer.on("error", (err) => {
  console.log(err)
})

ioServer.on("connection", (socket) => {
  console.log("client connected")
})

setInterval(() => {
  ioServer.emit("hello", "world")
},1000)
export default app;
