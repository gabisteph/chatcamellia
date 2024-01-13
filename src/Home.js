import { Box } from "@mui/material";
import React from "react";
import ContactList from "./ContactList";
import Chat from "./Chat";

const Home = () => {
  return (
    <Box display="flex" flexDirection="row" height="100vh">
      <ContactList />
      <Box
        sx={{
          border: ".05px solid #2f3b44",
        }}
      />
      <Chat />
    </Box>
  );
};

export default Home;
