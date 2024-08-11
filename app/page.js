'use client';

import { Box, Button, Stack, TextField, CircularProgress, Typography, AppBar, Toolbar, Paper, Avatar } from '@mui/material';
import { useState, useRef, useEffect } from 'react';
import { ChatBubbleOutline } from '@mui/icons-material';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Welcome to FinHelp, your personal AI customer service assistant at Quantum Bank. Available 24/7, FinHelp is here to enhance your banking experience with swift, accurate, and friendly support for all your needs.",
    },
  ]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  const getPredefinedResponse = (message) => {
    const responses = {
      "hello": "Hello! How can I assist you today?",
      "i need help": "I'm here to help! What do you need assistance with?",
      "what is my bank account number": "For security reasons, I cannot provide your bank account number.",
      "what is my routing number": "Please check your bank statement or contact your bank to retrieve your routing number.",
      "how can i reset my password": "You can reset your password by clicking on 'Forgot Password' on the login page or contacting our support team.",
      "how do i check my account balance": "You can check your account balance by logging into your account on our website or using our mobile app.",
      "how can i transfer money": "To transfer money, log into your account and navigate to the 'Transfer' section. Follow the prompts to complete your transfer.",
      "what are your customer support hours": "Our customer support is available 24/7 to assist you with any issues or inquiries.",
      "how do i update my personal information": "You can update your personal information by logging into your account and visiting the 'Profile' or 'Account Settings' section.",
      "how do i report a lost or stolen card": "To report a lost or stolen card, please contact our support team immediately at 1-800-QUANTUM.",
    };
    return responses[message.toLowerCase()] || null;
  };

  const sendMessage = async () => {
    const currentMessage = message.trim();
    if (!currentMessage) return;

    setLoading(true);
    setMessage('');

    const predefinedResponse = getPredefinedResponse(currentMessage);
    if (predefinedResponse) {
      setMessages((messages) => [
        ...messages,
        { role: 'user', content: currentMessage },
        { role: 'assistant', content: predefinedResponse },
      ]);
      setLoading(false);
      return;
    }

    setMessages((messages) => [
      ...messages,
      { role: 'user', content: currentMessage },
      { role: 'assistant', content: '' },
    ]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: currentMessage }]),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        result += text;

        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ];
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "Sorry, there was an error processing your request." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Box width="100vw" height="100vh" display="flex" flexDirection="column" justifyContent="flex-start" alignItems="center" bgcolor="#f5f5f5">
      <AppBar position="static" sx={{ bgcolor: 'green' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            FinHelp at Quantum Bank
          </Typography>
        </Toolbar>
      </AppBar>

      <Paper elevation={3} sx={{ width: '500px', height: '700px', marginTop: '20px', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
        <Stack
          direction="column"
          spacing={2}
          p={2}
          flexGrow={1}
          overflow="auto"
          sx={{ backgroundColor: '#e0e0e0', borderRadius: 2 }}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}
              alignItems="center" // Align items vertically
              mb={1}
            >
              {message.role === 'assistant' && (
                <Avatar sx={{ bgcolor: 'green', marginRight: 1 }}>
                  <ChatBubbleOutline />
                </Avatar>
              )}
              <Box
                bgcolor={message.role === 'assistant' ? 'green' : 'grey'}
                color="white"
                borderRadius={2} // More rectangular shape with slight rounding
                p={2}
                maxWidth="70%"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Typography variant="body1">{message.content}</Typography>
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>

        <Stack direction="row" spacing={2} p={2} sx={{ borderTop: '1px solid #cccccc', bgcolor: '#ffffff' }}>
          <TextField
            label="Type your message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={loading}
            variant="outlined"
            size="small"
          />
          <Button variant="contained" onClick={sendMessage} disabled={loading} sx={{ bgcolor: 'green', '&:hover': { bgcolor: 'darkgreen' } }}>
            {loading ? <CircularProgress size={24} /> : 'Send'}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
