import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Input from "@mui/material/Input";
import CustomAppBar from "./foundation/CustomAppBar/CustomAppBar.jsx";
import CustomMenuButton from "./foundation/CustomMenuButton/CustomMenuButton.jsx";
import { leftPanelMenuItem } from "./assets/utils/constant.js";
import ChatIcon from "@mui/icons-material/Chat";
import DonutLargeIcon from "@mui/icons-material/DonutLarge";
import ChatCard from "./foundation/ChatCard/ChatCard.jsx";
import SearchIcon from "@mui/icons-material/Search";
import { ChatCardType } from "./assets/utils/LeftPanel.types.js";
import React, { useState } from "react";
import AddIcon from "@mui/icons-material/Add";

export default function ContactList() {
  const [localChats, setLocalChats] = useState([]);
  const [newUsername, setNewUsername] = useState("");

  const handleAddUser = async () => {
    if (newUsername.trim() === "") {
      return;
    }

    const newUser = {
      name: newUsername,
      lastText: "New User",
      lastSeen: "Just now",
      selected: false,
    };

    // Adiciona o novo usuário à lista local
    setLocalChats((prevChats) => [...prevChats, newUser]);

    // Limpa o campo de nome de usuário
    setNewUsername("");

    // Realiza a requisição para buscar detalhes do novo usuário
    try {
      const response = await fetch(
        `http://localhost:5000/users/search?username=${(newUser.name)}`,
        {
          method: "POST", // Mudança para método POST
          headers: {
            "Content-Type": "application/json", // Adição do cabeçalho Content-Type
          },
        }
      );
      const userData = await response.json();

      if (response.ok) {
        // Faça algo com os dados do usuário retornado pelo backend
        console.log("Detalhes do usuário:", userData);
      } else {
        console.error("Erro ao buscar usuário:", response.statusText);
      }
    } catch (error) {
      console.error("Erro ao buscar usuário:", error.message);
    }
  };


  return (
    <Box height="100%" width="30%" overflow="hidden">
      <CustomAppBar>
        <Box
          width="100%"
          height="100%"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Avatar />
          <Box display="flex">
            <IconButton
              onClick={() => {}}
              sx={{
                paddingRight: "15px",
              }}
            >
              <DonutLargeIcon
                sx={{
                  color: "#afbac0",
                }}
              />
            </IconButton>
            <IconButton
              onClick={() => {}}
              sx={{
                paddingRight: "10px",
              }}
            >
              <ChatIcon
                sx={{
                  color: "#afbac0",
                }}
              />
            </IconButton>
            <CustomMenuButton menuItems={leftPanelMenuItem} />
          </Box>
        </Box>
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
          <IconButton onClick={() => {}}>
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
            placeholder="Search or start a new chat"
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
        <IconButton onClick={handleAddUser}>
          <AddIcon
            sx={{
              color: "#8696a1",
              height: "20px",
              width: "20px",
            }}
          />
        </IconButton>
      </Box>
      <Box
        overflow="auto"
        height="90%"
        sx={{
          background: "#101b20",
        }}
      >
        {localChats.map((item: ChatCardType) => {
          return <ChatCard item={item} />;
        })}
        <Box pt="50px" />
      </Box>
    </Box>
  );
}