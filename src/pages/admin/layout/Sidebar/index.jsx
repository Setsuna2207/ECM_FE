import React, { useEffect, useState } from "react"; // 🔹 thêm useEffect, useState
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  styled,
  Avatar,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SchoolIcon from "@mui/icons-material/School";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import QuizIcon from "@mui/icons-material/Quiz";
import PeopleIcon from "@mui/icons-material/People";
import RateReviewIcon from "@mui/icons-material/RateReview";
import CategoryIcon from "@mui/icons-material/Category";

export const drawerWidth = 200;

const SidebarContainer = styled(Drawer)(() => ({
  "& .MuiDrawer-paper": {
    width: drawerWidth,
    backgroundColor: "#F5F3FF",
    borderRight: "1px solid #eee",
    color: "#333",
  },
}));

const menuItems = [
  { text: "Hồ sơ", icon: <DashboardIcon />, path: "/admin" },
  { text: "Người dùng", icon: <PeopleIcon />, path: "/admin/users" },
  { text: "Danh mục", icon: <CategoryIcon />, path: "/admin/categories" },
  { text: "Khóa học", icon: <SchoolIcon />, path: "/admin/courses" },
  { text: "Bài giảng", icon: <VideoLibraryIcon />, path: "/admin/lessons" },
  { text: "Quiz", icon: <QuizIcon />, path: "/admin/quizzes" },
  { text: "Đánh giá", icon: <RateReviewIcon />, path: "/admin/reviews" },
  { text: "Test", icon: <QuizIcon />, path: "/admin/tests" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);

  // Lấy thông tin user đăng nhập từ localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (user) setCurrentUser(user);
  }, []);

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <SidebarContainer
      variant="permanent"
      anchor="left"
      sx={{
        width: drawerWidth,
        "& .MuiDrawer-paper": { width: drawerWidth, overflowX: "hidden" },
      }}
    >
      {/* Tiêu đề Sidebar */}
      <Box sx={{ px: 2, py: 3 }}>
        <Typography
          variant="h5"
          fontWeight="bold"
          color="#4038D2"
          sx={{ textAlign: "center" }}
        >
          ĐIỀU HƯỚNG QUẢN LÝ
        </Typography>
      </Box>

      {/* Avatar + Tên người dùng */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Avatar
          src={currentUser?.avatar || ""}
          alt={currentUser?.fullName || "A"}
          sx={{
            width: 80,
            height: 80,
            mb: 1,
            backgroundColor: "#4038D2",
            fontSize: "2rem",
          }}
        >
          {!currentUser?.avatar && (currentUser?.fullName?.[0] || "A")}
        </Avatar>

        <Typography
          variant="subtitle1"
          fontWeight="bold"
          color="#333"
          textAlign="center"
        >
          {currentUser?.fullName || "Admin User"}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {currentUser?.access === "admin" ? "Quản trị viên" : "Người dùng"}
        </Typography>
      </Box>

      {/* Danh sách menu */}
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              sx={{
                pl: 2,
                backgroundColor: isActive(item.path) ? "#eae8ff" : "transparent",
                "&:hover": { backgroundColor: "#f3f1ff" },
              }}
              selected={isActive(item.path)}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon sx={{ color: "#4038D2", minWidth: 0, mr: 2 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  fontWeight: 600,
                  color: isActive(item.path) ? "#4038D2" : "#333",
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </SidebarContainer>
  );
}
