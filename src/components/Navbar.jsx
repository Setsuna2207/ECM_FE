import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  TextField,
  Popover,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Avatar,
} from "@mui/material";
import { ExpandMore, Search } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom"; // Import useLocation

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation(); // Get the current location

  const categories = {
    LEVEL: ["TOEIC", "IELTS", "TOEFL", "GENERAL"],
    SKILL: ["VOCABULARY", "GRAMMAR", "WRITING", "LISTENING", "READING"],
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("currentUser"));
    setCurrentUser(savedUser);
  }, []);

  const isInTestRoute = location.pathname.startsWith("/test/"); // Check if the user is in a test route

  const handleInteraction = (callback) => {
    if (isInTestRoute) {
      const confirmLeave = window.confirm("Thao tác sẽ hủy bài thi của bạn. Bạn có chắc chắn muốn tiếp tục?");
      if (!confirmLeave) return;
    }
    callback();
  };

  const handleExploreClick = (event) => handleInteraction(() => setAnchorEl(event.currentTarget));
  const handleCloseExplore = () => setAnchorEl(null);
  const openExplore = Boolean(anchorEl);

  const handleLevelClick = (level) => handleInteraction(() => {
    navigate(`/courses/${level.toLowerCase()}`);
    handleCloseExplore();
  });

  const handleSkillClick = (skill) => handleInteraction(() => {
    navigate(`/courses/${skill.toLowerCase()}`);
    handleCloseExplore();
  });

  const handleLogout = () => handleInteraction(() => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    navigate("/");
  });

  return (
    <AppBar
      position="sticky"
      elevation={2}
      sx={{
        backgroundColor: "#fff",
        color: "#333",
        borderBottom: "1px solid #eee",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* 🔹 Logo + Khám phá */}
        <Box display="flex" alignItems="center" gap={3}>
          <Box
            component="img"
            src="/src/assets/ECM.png"
            alt="ECM Logo"
            sx={{ height: 55, cursor: "pointer" }}
            onClick={() => handleInteraction(() => navigate("/"))}
          />

          <Button
            variant="text"
            endIcon={<ExpandMore />}
            onClick={handleExploreClick}
            sx={{
              color: "#4038d2ff",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": { backgroundColor: "#f3f1ff" },
            }}
          >
            Khám phá
          </Button>

          {/* Popover khám phá */}
          <Popover
            open={openExplore}
            anchorEl={anchorEl}
            onClose={handleCloseExplore}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
            PaperProps={{
              sx: {
                borderRadius: 3,
                mt: 1,
                p: 2,
                minWidth: 320,
                boxShadow: 3,
              },
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold" mb={1} color="#060080ff">
              Khám phá khóa học
            </Typography>
            <Divider sx={{ mb: 1 }} />
            <Box display="flex" gap={3}>
              {/* Level */}
              <Paper
                elevation={0}
                sx={{
                  flex: 1,
                  p: 1,
                  borderRadius: 2,
                  border: "1px solid #eee",
                }}
              >
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  sx={{ mb: 1 }}
                  color="#060080ff"
                >
                  Level
                </Typography>
                <List dense>
                  {categories.LEVEL.map((level) => (
                    <ListItemButton
                      key={level}
                      selected={selectedLevel === level}
                      onClick={() => handleLevelClick(level)}
                      sx={{
                        borderRadius: 1,
                        "&.Mui-selected": {
                          backgroundColor: "#f3f1ff",
                        },
                      }}
                    >
                      <ListItemText primary={level} />
                    </ListItemButton>
                  ))}
                </List>
              </Paper>

              {/* Skill */}
              <Paper
                elevation={0}
                sx={{
                  flex: 1,
                  p: 1,
                  borderRadius: 2,
                  border: "1px solid #eee",
                }}
              >
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  sx={{ mb: 1 }}
                  color="#060080ff"
                >
                  Skill
                </Typography>
                <List dense>
                  {categories.SKILL.map((skill) => (
                    <ListItemButton
                      key={skill}
                      onClick={() => handleSkillClick(skill)}
                      sx={{
                        borderRadius: 1,
                        "&:hover": {
                          backgroundColor: "#f3f1ff",
                        },
                      }}
                    >
                      <ListItemText primary={skill} />
                    </ListItemButton>
                  ))}
                </List>
              </Paper>
            </Box>
          </Popover>
        </Box>

        {/* 🔹 Ô tìm kiếm */}
        <Box display="flex" alignItems="center" gap={1}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleInteraction(() => {
                if (searchTerm.trim()) navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
              });
            }}
          >
            <TextField
              size="small"
              placeholder="Tìm kiếm khóa học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ color: "#888", mr: 1 }} />,
              }}
              sx={{
                width: 400,
                backgroundColor: "white",
                borderRadius: 3,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  "&:hover fieldset": { borderColor: "#6C63FF" },
                  "&.Mui-focused fieldset": { borderColor: "#6C63FF" },
                },
              }}
            />
          </form>
        </Box>

        {/* 🔹 Nút hành động bên phải */}
        <Box display="flex" alignItems="center" gap={2}>
          {!currentUser ? (
            <>
              <Button
                variant="outlined"
                onClick={() => handleInteraction(() => navigate("/login"))}
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
                Đăng nhập
              </Button>
              <Button
                variant="contained"
                onClick={() => handleInteraction(() => navigate("/register"))}
                sx={{
                  backgroundColor: "#4038d2ff",
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": {
                    backgroundColor: "#73169aff",
                  },
                }}
              >
                Đăng ký
              </Button>
            </>
          ) : (
            <>
              {currentUser.access === "admin" ? (
                <>
                  <Button
                    variant="contained"
                    onClick={() => handleInteraction(() => navigate("/tests"))}
                    sx={{
                      backgroundColor: "#4038d2ff",
                      color: "#fff",
                      borderRadius: 3,
                      textTransform: "none",
                      fontWeight: 600,
                      "&:hover": { backgroundColor: "#73169aff" },
                    }}
                  >
                    Test
                  </Button>

                  <Button
                    variant="contained"
                    onClick={() => handleInteraction(() => navigate("/admin"))}
                    sx={{
                      backgroundColor: "#4038d2ff",
                      color: "#fff",
                      borderRadius: 3,
                      textTransform: "none",
                      fontWeight: 600,
                      "&:hover": { backgroundColor: "#73169aff" },
                    }}
                  >
                    Trang điều khiển
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="contained"
                    onClick={() => handleInteraction(() => navigate("/tests"))}
                    sx={{
                      backgroundColor: "#4038d2ff",
                      color: "#fff",
                      borderRadius: 3,
                      textTransform: "none",
                      fontWeight: 600,
                      "&:hover": { backgroundColor: "#73169aff" },
                    }}
                  >
                    Test
                  </Button>

                  <Button
                    variant="contained"
                    onClick={() => handleInteraction(() => navigate("/profile"))}
                    sx={{
                      backgroundColor: "#4038d2ff",
                      color: "#fff",
                      borderRadius: 3,
                      textTransform: "none",
                      fontWeight: 600,
                      "&:hover": { backgroundColor: "#73169aff" },
                    }}
                  >
                    Hồ sơ
                  </Button>
                </>
              )}

              <Button
                variant="outlined"
                onClick={handleLogout}
                sx={{
                  borderColor: "#ff3b30",
                  color: "#ff3b30",
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": {
                    backgroundColor: "#ffe5e5",
                    borderColor: "#ff3b30",
                  },
                }}
              >
                Đăng xuất
              </Button>

              <Avatar
                src={currentUser.avatar}
                alt={currentUser.fullName}
                sx={{
                  width: 40,
                  height: 40,
                  border: "2px solid #4038d2ff",
                }}
              />
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
