const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());

io.on('connection', (socket) => {
  console.log('새로운 사용자가 연결되었습니다.');

  socket.on('message', (message) => {
    console.log('메시지 수신:', message);
    io.emit('message', message);
  });

  socket.on('drawing', (data) => {
    console.log('그림 이벤트 수신:', data);
    io.emit('drawing', data);
  });

  socket.on('disconnect', () => {
    console.log('사용자가 연결을 해제했습니다.');
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
}); 