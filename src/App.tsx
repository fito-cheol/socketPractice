import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { 
  Container, 
  TextField, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  Paper,
  Box,
  Typography,
  AppBar,
  Toolbar,
  Tabs,
  Tab
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import BrushIcon from '@mui/icons-material/Brush';

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
}

interface DrawingData {
  type: 'start' | 'draw' | 'end';
  x: number;
  y: number;
  color: string;
  lineWidth: number;
}

const App: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(5);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastX = useRef(0);
  const lastY = useRef(0);

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('message', (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    newSocket.on('drawing', (data: DrawingData) => {
      drawOnCanvas(data);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const drawOnCanvas = (data: DrawingData) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = data.x * rect.width;
    const y = data.y * rect.height;

    ctx.strokeStyle = data.color;
    ctx.lineWidth = data.lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (data.type === 'start') {
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else if (data.type === 'draw') {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const handleSendMessage = () => {
    if (socket && message.trim() && username.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: message,
        sender: username,
        timestamp: new Date(),
      };
      socket.emit('message', newMessage);
      setMessage('');
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !socket) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    isDrawing.current = true;
    lastX.current = x;
    lastY.current = y;

    const drawingData: DrawingData = {
      type: 'start',
      x,
      y,
      color,
      lineWidth
    };

    // 로컬에서 먼저 그림
    drawOnCanvas(drawingData);
    // 소켓으로 전송
    socket.emit('drawing', drawingData);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !canvasRef.current || !socket) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const drawingData: DrawingData = {
      type: 'draw',
      x,
      y,
      color,
      lineWidth
    };

    // 로컬에서 먼저 그림
    drawOnCanvas(drawingData);
    // 소켓으로 전송
    socket.emit('drawing', drawingData);

    lastX.current = x;
    lastY.current = y;
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            채팅 앱
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
          <TextField
            fullWidth
            label="사용자 이름"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            margin="normal"
          />
        </Paper>
        
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="채팅" icon={<SendIcon />} />
          <Tab label="그림판" icon={<BrushIcon />} />
        </Tabs>

        {activeTab === 0 ? (
          <>
            <Paper elevation={3} sx={{ p: 2, mb: 2, height: '400px', overflow: 'auto' }}>
              <List>
                {messages.map((msg) => (
                  <ListItem key={msg.id}>
                    <ListItemText
                      primary={msg.text}
                      secondary={`${msg.sender} - ${new Date(msg.timestamp).toLocaleTimeString()}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  label="메시지 입력"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button
                  variant="contained"
                  endIcon={<SendIcon />}
                  onClick={handleSendMessage}
                  disabled={!message.trim() || !username.trim()}
                >
                  전송
                </Button>
              </Box>
            </Paper>
          </>
        ) : (
          <Paper elevation={3} sx={{ p: 2 }}>
            <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                type="color"
                label="색상"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                sx={{ width: 100 }}
              />
              <TextField
                type="number"
                label="선 두께"
                value={lineWidth}
                onChange={(e) => setLineWidth(Number(e.target.value))}
                sx={{ width: 100 }}
              />
              <Button variant="contained" onClick={clearCanvas}>
                지우기
              </Button>
            </Box>
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              style={{ border: '1px solid #ccc', cursor: 'crosshair' }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseOut={stopDrawing}
            />
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default App; 