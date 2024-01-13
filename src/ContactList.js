// Importando os módulos e componentes necessários
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
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";

// Definindo o array de chats locais
const localChats = [
  {
    name: "Balram",
    lastText: "Hey there testing WhatsApp",
    lastSeen: "4:21 PM",
    selected: true,
  },
  {
    name: "Dev Stack",
    lastText: "DevStack testing WhatsApp",
    lastSeen: "8:51 PM",
    selected: false,
  },
  // ... (restante dos itens omitidos para brevidade)
];

// Componente principal ContactList
export default function ContactList() {
  return (
    <Box height="100%" width="30%" overflow="hidden">
      {/* Componente CustomAppBar */}
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
            {/* Ícone DonutLarge */}
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

            {/* Ícone Chat */}
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

            {/* Componente CustomMenuButton */}
            <CustomMenuButton menuItems={leftPanelMenuItem} />
          </Box>
        </Box>
      </CustomAppBar>

      {/* Barra de pesquisa e filtro */}
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
          {/* Ícone de pesquisa */}
          <IconButton onClick={() => {}}>
            <SearchIcon
              sx={{
                color: "#8696a1",
                height: "20px",
                width: "20px",
              }}
            />
          </IconButton>

          {/* Campo de entrada de pesquisa */}
          <Input
            fullWidth
            disableUnderline
            placeholder="Search or start a new chat"
            sx={{
              height: "35px",
              color: "white",
              padding: "0px 13px",
              fontSize: "14px",
            }}
          />
        </Box>

        {/* Ícone de filtro */}
        <IconButton onClick={() => {}}>
          <FilterListIcon
            sx={{
              color: "#8696a1",
              height: "20px",
              width: "20px",
            }}
          />
        </IconButton>
      </Box>

      {/* Lista de chats */}
      <Box
        overflow="auto"
        height="90%"
        sx={{
          background: "#101b20",
        }}
      >
        {localChats.map((item) => {
          return <ChatCard item={item} />;
        })}
        <Box pt="50px" />
      </Box>
    </Box>
  );
}
