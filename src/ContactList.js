import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Input from "@mui/material/Input";
import CustomAppBar from "./foundation/CustomAppBar/CustomAppBar.jsx";
import SearchIcon from "@mui/icons-material/Search";
import React, { useEffect, useState } from "react";
import ChatCard from "./foundation/ChatCard/ChatCard.jsx";

export default function ContactList() {
  const [localChats, setLocalChats] = useState([]);
  const [newUsername, setNewUsername] = useState("");

  useEffect(() => {
    const handleStatusChange = (data) => {
      const { username, online } = data;
      // Atualiza o status online do usuário na lista local
      setLocalChats((prevChats) =>
        prevChats.map((chat) =>
          chat.username === username ? { ...chat, online } : chat
        )
      );
    };

    // Conecta ao servidor WebSocket
    const ws = new WebSocket("ws://localhost:5000");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "status_change":
          handleStatusChange(data);
          break;
        // Adicione outros casos conforme necessário
        default:
          break;
      }
    };

    // Carregar usuários online quando a página é carregada
    fetchUsersOnline();

    return () => {
      ws.close();
    };
  }, []);

  const fetchUsersOnline = async () => {
    try {
      const response = await fetch(`http://localhost:8000/users/online`);
      if (response.ok) {
        const onlineUsers = await response.json();
        setLocalChats(onlineUsers);
      } else {
        console.error("Erro ao buscar usuários online:", response.statusText);
      }
    } catch (error) {
      console.error("Erro ao buscar usuários online:", error.message);
    }
  };

  const handleSearchUser = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/users/search?username=${newUsername}`
      );
  
      if (!response.ok) {
        throw new Error(`Erro ao buscar usuário: ${response.statusText}`);
      }
  
      const userData = await response.json();
      // Adicione o usuário à lista local
      setLocalChats((prevChats) => [...prevChats, userData]);
      // Limpe o campo de pesquisa
      setNewUsername("");
    } catch (error) {
      console.error(error.message);
      // Trate o erro conforme necessário
    }
  };

  return (
    <Box height="100%" width="30%" overflow="hidden">
      <CustomAppBar>
        {/* ... (o restante do seu código) */}
      </CustomAppBar>
      <Box
        sx={{
          background: "#101b20",
          padding: "12px",
        }}
        display="flex"
      >
        <Box
          display="flex"
          sx={{
            background: "#1f2c33",
            borderRadius: "8px",
            padding: "0px 8px",
          }}
          flex={1}
          alignItems="center"
        >
          <IconButton onClick={handleSearchUser}>
            <SearchIcon
              sx={{
                color: "#8696a1",
                height: "20px",
                width: "20px",
              }}
            />
          </IconButton>
          <Input
            fullWidth
            disableUnderline
            placeholder="Buscar usuários online"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            sx={{
              height: "35px",
              color: "white",
              padding: "0px 13px",
              fontSize: "14px",
            }}
          />
        </Box>
      </Box>
      <Box
        overflow="auto"
        height="90%"
        sx={{
          background: "#101b20",
        }}
      >
        {localChats.map((item) => (
          <ChatCard key={item.id} item={item} />
        ))}
        <Box pt="50px" />
      </Box>
    </Box>
  );
}