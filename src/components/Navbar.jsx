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
  Badge,
  IconButton,
  Chip,
  alpha,
  Tooltip,
} from "@mui/material";
import {
  ExpandMore,
  Search,
  Dashboard,
  Quiz,
  Person,
  Logout,
  School,
  MenuBook,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { GetAllCategory } from "../services/categoryService";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [categories, setCategories] = useState({ LEVEL: [], SKILL: [] });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

useEffect(() => {
  const loadUser = () => {
    const savedUser = JSON.parse(localStorage.getItem("currentUser"));
    console.log("Navbar - Loading user:", savedUser);
    console.log("Navbar - Avatar:", savedUser?.avatar);
    setCurrentUser(savedUser);
  };

  loadUser();

  const handleUserUpdate = () => {
    console.log("🔍 Navbar - User updated event received");
    loadUser();
  };

  window.addEventListener('storage', handleUserUpdate);
  window.addEventListener('userUpdated', handleUserUpdate);

  return () => {
    window.removeEventListener('storage', handleUserUpdate);
    window.removeEventListener('userUpdated', handleUserUpdate);
  };
}, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await GetAllCategory();
        console.log("Categories response:", response);

        let categoryData = [];

        // Handle different response structures
        if (response.data && response.data.data) {
          categoryData = response.data.data;
        } else if (response.data && Array.isArray(response.data)) {
          categoryData = response.data;
        } else if (Array.isArray(response.data)) {
          categoryData = response.data;
        }

        console.log("Category data:", categoryData);

        // Organize categories by description (LEVEL or SKILL)
        const organized = {
          LEVEL: [],
          SKILL: []
        };

        if (Array.isArray(categoryData)) {
          categoryData.forEach(cat => {
            if (cat.description === "LEVEL") {
              organized.LEVEL.push(cat.name);
            } else if (cat.description === "SKILL") {
              organized.SKILL.push(cat.name);
            }
          });
        }

        console.log("Organized categories:", organized);
        setCategories(organized);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        // Fallback to empty categories if fetch fails
        setCategories({ LEVEL: [], SKILL: [] });
      }
    };

    fetchCategories();
  }, []);

  const isInTestRoute = location.pathname.startsWith("/test/");

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

  // Icon mapping for categories
  const categoryIcons = {
    TOEIC: "🎯",
    IELTS: "🌟",
    TOEFL: "📚",
    GENERAL: "📖",
    VOCABULARY: "📝",
    GRAMMAR: "✏️",
    WRITING: "✍️",
    LISTENING: "🎧",
    READING: "📖",
  };

  const getIcon = (categoryName) => {
    return categoryIcons[categoryName] || "📚";
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: "#fff",
        color: "#333",
        borderBottom: "2px solid",
        borderImage: "linear-gradient(90deg, #4038d2ff, #73169aff) 1",
        backdropFilter: "blur(10px)",
        boxShadow: "0 4px 20px rgba(64, 56, 210, 0.08)",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", py: 0.5 }}>
        {/* Logo + Khám phá */}
        <Box display="flex" alignItems="center" gap={2}>
          <Box
            component="img"
            src="/src/assets/ECM.png"
            alt="ECM Logo"
            sx={{
              height: 45,
              cursor: "pointer",
              transition: "transform 0.3s ease",
              "&:hover": {
                transform: "scale(1.05)",
              },
            }}
            onClick={() => handleInteraction(() => navigate("/"))}
          />

          <Button
            variant="text"
            endIcon={
              <ExpandMore
                sx={{
                  transition: "transform 0.3s",
                  transform: openExplore ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            }
            onClick={handleExploreClick}
            sx={{
              color: "#4038d2ff",
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.9rem",
              px: 2,
              py: 0.5,
              borderRadius: 3,
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "#f3f1ff",
                transform: "scaleX(0)",
                transformOrigin: "left",
                transition: "transform 0.3s ease",
                zIndex: -1,
              },
              "&:hover::before": {
                transform: "scaleX(1)",
              },
              "&:hover": {
                backgroundColor: "transparent",
              },
            }}
          >
            <School sx={{ mr: 0.5 }} />
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
                borderRadius: 4,
                mt: 1.5,
                p: 3,
                minWidth: 380,
                boxShadow: "0 8px 32px rgba(64, 56, 210, 0.15)",
                border: "1px solid",
                borderColor: alpha("#4038d2ff", 0.1),
              },
            }}
          >
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <MenuBook sx={{ color: "#4038d2ff" }} />
              <Typography variant="h6" fontWeight="bold" color="#060080ff">
                Khám phá khóa học
              </Typography>
            </Box>
            <Divider sx={{ mb: 2, borderColor: alpha("#4038d2ff", 0.1) }} />

            <Box display="flex" gap={2}>
              {/* Level */}
              <Paper
                elevation={0}
                sx={{
                  flex: 1,
                  p: 2,
                  borderRadius: 3,
                  border: "2px solid",
                  borderColor: alpha("#4038d2ff", 0.1),
                  background: `linear-gradient(135deg, ${alpha("#f3f1ff", 0.3)} 0%, ${alpha("#fff", 1)} 100%)`,
                }}
              >
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}
                  color="#060080ff"
                >
                  🎓 Level
                </Typography>
                <List dense sx={{ p: 0 }}>
                  {categories.LEVEL.map((level) => (
                    <ListItemButton
                      key={level}
                      selected={selectedLevel === level}
                      onClick={() => handleLevelClick(level)}
                      sx={{
                        borderRadius: 2,
                        mb: 0.5,
                        transition: "all 0.2s",
                        "&.Mui-selected": {
                          backgroundColor: "#f3f1ff",
                          borderLeft: "3px solid #4038d2ff",
                        },
                        "&:hover": {
                          backgroundColor: alpha("#f3f1ff", 0.7),
                          transform: "translateX(4px)",
                        },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <span>{getIcon(level)}</span>
                            <Typography fontWeight={500}>{level}</Typography>
                          </Box>
                        }
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Paper>

              {/* Skill */}
              <Paper
                elevation={0}
                sx={{
                  flex: 1,
                  p: 2,
                  borderRadius: 3,
                  border: "2px solid",
                  borderColor: alpha("#73169aff", 0.1),
                  background: `linear-gradient(135deg, ${alpha("#f3f1ff", 0.3)} 0%, ${alpha("#fff", 1)} 100%)`,
                }}
              >
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}
                  color="#060080ff"
                >
                  🎯 Skill
                </Typography>
                <List dense sx={{ p: 0 }}>
                  {categories.SKILL.map((skill) => (
                    <ListItemButton
                      key={skill}
                      onClick={() => handleSkillClick(skill)}
                      sx={{
                        borderRadius: 2,
                        mb: 0.5,
                        transition: "all 0.2s",
                        "&:hover": {
                          backgroundColor: alpha("#f3f1ff", 0.7),
                          transform: "translateX(4px)",
                          borderLeft: "3px solid #73169aff",
                        },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <span>{getIcon(skill)}</span>
                            <Typography fontWeight={500}>{skill}</Typography>
                          </Box>
                        }
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Paper>
            </Box>
          </Popover>
        </Box>

        {/* Ô tìm kiếm */}
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
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              InputProps={{
                startAdornment: (
                  <Search
                    sx={{
                      color: isSearchFocused ? "#4038d2ff" : "#888",
                      mr: 1,
                      transition: "color 0.3s",
                    }}
                  />
                ),
              }}
              sx={{
                width: 350,
                backgroundColor: "white",
                borderRadius: 3,
                transition: "all 0.3s",
                transform: isSearchFocused ? "scale(1.02)" : "scale(1)",
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  transition: "all 0.3s",
                  "&:hover fieldset": {
                    borderColor: "#4038d2ff",
                    borderWidth: 2,
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#4038d2ff",
                    borderWidth: 2,
                    boxShadow: `0 0 0 3px ${alpha("#4038d2ff", 0.1)}`,
                  },
                },
              }}
            />
          </form>
        </Box>

        {/* Nút hành động bên phải */}
        <Box display="flex" alignItems="center" gap={1}>
          {!currentUser ? (
            <>
              <Button
                variant="outlined"
                onClick={() => handleInteraction(() => navigate("/login"))}
                sx={{
                  borderColor: "#4038d2ff",
                  color: "#4038d2ff",
                  borderRadius: 3,
                  borderWidth: 2,
                  textTransform: "none",
                  fontWeight: 700,
                  px: 2,
                  py: 0.5,
                  transition: "all 0.3s",
                  "&:hover": {
                    backgroundColor: "#f3f1ff",
                    borderColor: "#73169aff",
                    borderWidth: 2,
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(64, 56, 210, 0.2)",
                  },
                }}
              >
                Đăng nhập
              </Button>
              <Button
                variant="contained"
                onClick={() => handleInteraction(() => navigate("/register"))}
                sx={{
                  background: "linear-gradient(135deg, #4038d2ff 0%, #73169aff 100%)",
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 700,
                  px: 2,
                  py: 0.5,
                  boxShadow: "0 4px 12px rgba(64, 56, 210, 0.3)",
                  transition: "all 0.3s",
                  "&:hover": {
                    background: "linear-gradient(135deg, #73169aff 0%, #4038d2ff 100%)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 16px rgba(64, 56, 210, 0.4)",
                  },
                }}
              >
                Đăng ký
              </Button>
            </>
          ) : (
            <>
              {currentUser.access === "admin" || currentUser.roles === "Admin" ? (
                <>
                  <Tooltip title="Làm bài test" arrow>
                    <Button
                      variant="contained"
                      startIcon={<Quiz />}
                      onClick={() => handleInteraction(() => navigate("/tests"))}
                      sx={{
                        background: "linear-gradient(135deg, #4038d2ff 0%, #73169aff 100%)",
                        color: "#fff",
                        borderRadius: 3,
                        textTransform: "none",
                        fontWeight: 700,
                        px: 2.5,
                        py: 0.5,
                        boxShadow: "0 4px 12px rgba(64, 56, 210, 0.3)",
                        transition: "all 0.3s",
                        "&:hover": {
                          background: "linear-gradient(135deg, #73169aff 0%, #4038d2ff 100%)",
                          transform: "translateY(-2px)",
                          boxShadow: "0 6px 16px rgba(64, 56, 210, 0.4)",
                        },
                      }}
                    >
                      Test
                    </Button>
                  </Tooltip>

                  <Tooltip title="Quản trị hệ thống" arrow>
                    <Button
                      variant="contained"
                      startIcon={<Dashboard />}
                      onClick={() => handleInteraction(() => navigate("/admin"))}
                      sx={{
                        background: "linear-gradient(135deg, #4038d2ff 0%, #73169aff 100%)",
                        color: "#fff",
                        borderRadius: 3,
                        textTransform: "none",
                        fontWeight: 700,
                        px: 2.5,
                        py: 0.5,
                        boxShadow: "0 4px 12px rgba(64, 56, 210, 0.3)",
                        transition: "all 0.3s",
                        "&:hover": {
                          background: "linear-gradient(135deg, #73169aff 0%, #4038d2ff 100%)",
                          transform: "translateY(-2px)",
                          boxShadow: "0 6px 16px rgba(64, 56, 210, 0.4)",
                        },
                      }}
                    >
                      Admin
                    </Button>
                  </Tooltip>
                </>
              ) : (
                <>
                  <Tooltip title="Làm bài test" arrow>
                    <Button
                      variant="contained"
                      startIcon={<Quiz />}
                      onClick={() => handleInteraction(() => navigate("/tests"))}
                      sx={{
                        background: "linear-gradient(135deg, #4038d2ff 0%, #73169aff 100%)",
                        color: "#fff",
                        borderRadius: 3,
                        textTransform: "none",
                        fontWeight: 700,
                        px: 2.5,
                        py: 0.5,
                        boxShadow: "0 4px 12px rgba(64, 56, 210, 0.3)",
                        transition: "all 0.3s",
                        "&:hover": {
                          background: "linear-gradient(135deg, #73169aff 0%, #4038d2ff 100%)",
                          transform: "translateY(-2px)",
                          boxShadow: "0 6px 16px rgba(64, 56, 210, 0.4)",
                        },
                      }}
                    >
                      Test
                    </Button>
                  </Tooltip>

                  <Tooltip title="Hồ sơ cá nhân" arrow>
                    <Button
                      variant="contained"
                      startIcon={<Person />}
                      onClick={() => handleInteraction(() => navigate("/profile"))}
                      sx={{
                        background: "linear-gradient(135deg, #4038d2ff 0%, #73169aff 100%)",
                        color: "#fff",
                        borderRadius: 3,
                        textTransform: "none",
                        fontWeight: 700,
                        px: 2.5,
                        py: 0.5,
                        boxShadow: "0 4px 12px rgba(64, 56, 210, 0.3)",
                        transition: "all 0.3s",
                        "&:hover": {
                          background: "linear-gradient(135deg, #73169aff 0%, #4038d2ff 100%)",
                          transform: "translateY(-2px)",
                          boxShadow: "0 6px 16px rgba(64, 56, 210, 0.4)",
                        },
                      }}
                    >
                      Hồ sơ
                    </Button>
                  </Tooltip>
                </>
              )}

              <Tooltip title="Đăng xuất" arrow>
                <Button
                  variant="outlined"
                  startIcon={<Logout />}
                  onClick={handleLogout}
                  sx={{
                    borderColor: "#ff3b30",
                    color: "#ff3b30",
                    borderRadius: 3,
                    borderWidth: 2,
                    textTransform: "none",
                    fontWeight: 700,
                    px: 2.5,
                    py: 0.4,
                    transition: "all 0.3s",
                    "&:hover": {
                      backgroundColor: alpha("#ff3b30", 0.1),
                      borderColor: "#ff3b30",
                      borderWidth: 2,
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 12px rgba(255, 59, 48, 0.3)",
                    },
                  }}
                >
                  Đăng xuất
                </Button>
              </Tooltip>

              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                badgeContent={
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      backgroundColor: "#44b700",
                      border: "2px solid white",
                    }}
                  />
                }
              >
                <Avatar
                  src={currentUser.avatar}
                  alt={currentUser.fullName}
                  sx={{
                    width: 44,
                    height: 44,
                    border: "3px solid",
                    borderColor: "#4038d2ff",
                    boxShadow: "0 4px 12px rgba(64, 56, 210, 0.3)",
                    cursor: "pointer",
                    transition: "all 0.3s",
                    "&:hover": {
                      transform: "scale(1.1)",
                      boxShadow: "0 6px 16px rgba(64, 56, 210, 0.4)",
                    },
                  }}
                  onClick={() => handleInteraction(() => navigate("/profile"))}
                />
              </Badge>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}