import { Box } from "@mui/material";
import React from "react";
import ContactList from "./ContactList";
import Chat from "./Chat";

const Home = () => {
  return (
    <Box display="flex"width="100%" flexDirection="row" height="100vh">
      <ContactList />
      <Box
        sx={{
          border: ".05px solid #9c6fe433",
        }}
      />
      <Chat />
    </Box>
  );
};

export default Home;
