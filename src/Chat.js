import React, { useState } from 'react';
import {
  Avatar,
  Box,
  IconButton,
  Input,
  Typography,
} from "@mui/material";
import CustomAppBar from "./foundation/CustomAppBar/CustomAppBar.jsx";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import MicIcon from "@mui/icons-material/Mic";

const Chat = () => {
  const globalIconStyle = {
    color: "#8696a1",
    height: "28px",
    width: "28px",
  };

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const sendMessage = () => {
    if (newMessage.trim() === '') {
      return;
    }

    const updatedMessages = [...messages, { text: newMessage, sender: 'user' }];
    setMessages(updatedMessages);
    setNewMessage('');
  };

  // Função para receber mensagens de outro cliente
  const receiveMessage = (message) => {
    setMessages((prevMessages) => [...prevMessages, { text: message.text, sender: 'other' }]);
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomAppBar>
        {/* ... (seu código existente para exibir informações do usuário) */}
      </CustomAppBar>
      <Box flex="1" overflowY="auto">
        {messages.map((message, index) => (
          <Box
            key={index}
            display="flex"
            justifyContent={message.sender === 'user' ? 'flex-end' : 'flex-start'}
            alignItems="flex-end"
            mb={1}
          >
            {message.sender === 'user' ? null : <Avatar />}
            <Box
              bgcolor={message.sender === 'user' ? '#2b3943' : '#394b59'}
              color="white"
              borderRadius="6px"
              p={1}
              maxWidth="70%"
            >
              <Typography variant="body1" sx={{ wordWrap: 'break-word' }}>
                {message.text}
              </Typography>
            </Box>
            {message.sender === 'user' ? (
              <Avatar sx={{ ml: 1 }} />
            ) : null}
          </Box>
        ))}
      </Box>
      <Box
        alignItems="center"
        display="flex"
        sx={{
          background: "1C1D21",
          padding: "0px 15px",
        }}
      >
        <IconButton onClick={() => {}}>
          <AttachFileIcon
            sx={{
              ...globalIconStyle,
              transform: "rotateY(0deg) rotate(45deg)",
            }}
          />
        </IconButton>
        <Box flex={1} pl="5px" pr="5px">
          <Input
            fullWidth
            disableUnderline
            placeholder="Type a message"
            sx={{
              background: "#2b3943",
              height: "42px",
              borderRadius: "6px",
              color: "white",
              padding: "0px 10px",
            }}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                sendMessage();
              }
            }}
          />
        </Box>
        <IconButton onClick={sendMessage}>
          <MicIcon sx={globalIconStyle} />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Chat;
