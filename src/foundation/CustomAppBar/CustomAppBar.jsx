import React from "react";
import Box from "@mui/material/Box";

function CustomAppBar({ children }) {
  return (
    <Box
      height="63px"
      sx={{
        background: "#6f549a",
        padding: "0px 20px",
      }}
    >
      {children}
    </Box>
  );
}

export default CustomAppBar;
