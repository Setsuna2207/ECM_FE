import React, { useState } from "react";
import {
  Box,
  Drawer,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Sidebar, { drawerWidth } from "../Sidebar";
import Navbar from "../Navbar";
import { Outlet } from "react-router-dom";

export default function Dashboard() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isSmallScreen = useMediaQuery("(max-width:900px)");

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f6fa" }}>
      {/* 🔹 Sidebar (cố định hoặc Drawer) */}
      {isSmallScreen ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
          }}
        >
          <Sidebar />
        </Drawer>
      ) : (
        <Box
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            bgcolor: "#fff",
            borderRight: "1px solid #e0e0e0",
            position: "fixed",
            top: 0,
            left: 0,
            bottom: 0,
            zIndex: 1000,
          }}
        >
          <Sidebar />
        </Box>
      )}

      {/* 🔹 Nội dung bên phải */}
      <Box
        sx={{
          flexGrow: 1,
          ml: isSmallScreen ? 0 : `${drawerWidth}px`, // ✅ dùng giá trị chung
          display: "flex",
          flexDirection: "column",
          width: "100%",
          minHeight: "100vh",
        }}
      >
        {/* Navbar */}
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: isSmallScreen ? 0 : `${drawerWidth}px`,
            right: 0,
            zIndex: 1200,
            backgroundColor: "#fff",
            borderBottom: "1px solid #e0e0e0",
            height: "64px",
            px: 2,
            display: "flex",
            alignItems: "center",
          }}
        >
          {isSmallScreen && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Navbar />
        </Box>

        {/* Nội dung chính */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            mt: "72px",
            p: 3,
            backgroundColor: "#fafafa",
            overflowY: "auto",
            height: "calc(100vh - 72px)",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
