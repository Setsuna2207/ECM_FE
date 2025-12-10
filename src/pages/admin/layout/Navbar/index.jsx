import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import HomeIcon from "@mui/icons-material/Home";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "transparent",
        height: "64px",
        px: 3,
      }}
    >
      {/* Logo */}
      <Box
        display="flex"
        alignItems="center"
        sx={{ cursor: "pointer" }}
        onClick={() => navigate("/")}
      >
        <Box
          component="img"
          src="/src/assets/ECM.png"
          alt="ECM Logo"
          sx={{ height: 45, mr: 1 }}
        />
      </Box>

      {/* Tiêu đề */}
      <Typography
        variant="h6"
        fontWeight="bold"
        sx={{
          flexGrow: 1,
          textAlign: "center",
          color: isAdminPage ? "#4038d2ff" : "#aaa",
          userSelect: "none",
        }}
      >
        {isAdminPage ? "QUẢN LÝ HỆ THỐNG" : ""}
      </Typography>

      <Box display="flex" alignItems="center" gap={2}>
        <Button
          startIcon={isAdminPage ? <HomeIcon /> : <SettingsIcon />}
          variant="text"
          sx={{
            textTransform: "none",
            color: "#4038d2ff",
            fontWeight: 600,
            "&:hover": { backgroundColor: "#f3f1ff" },
          }}
          onClick={() => navigate(isAdminPage ? "/" : "/admin")}
        >
          {isAdminPage ? "Trang chủ" : "Trang quản lý"}
        </Button>

        <Button
          startIcon={<LogoutIcon />}
          variant="outlined"
          onClick={handleLogout}
          sx={{
            borderColor: "#4038d2ff",
            color: "#4038d2ff",
            borderRadius: 3,
            textTransform: "none",
            fontWeight: 600,
            "&:hover": {
              backgroundColor: "#f3f1ff",
              borderColor: "#73169aff",
            },
          }}
        >
          Đăng xuất
        </Button>
      </Box>
    </Box>
  );
}
