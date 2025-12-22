import { useState, useEffect } from "react";
import {
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  Grid,
  Paper,
  TextField,
  Typography,
  Alert,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import HistoryIcon from "@mui/icons-material/History";
import FavoriteIcon from "@mui/icons-material/Favorite";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editingGoal, setEditingGoal] = useState(false);
  const [learningGoal, setLearningGoal] = useState("");
  const [password, setPassword] = useState("");
  const [aiFeedback, setAiFeedback] = useState(
    "AI sẽ đưa ra gợi ý khóa học dựa trên mục tiêu và năng lực của bạn..."
  );
  const [confirmMessage, setConfirmMessage] = useState("");

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!savedUser) {
      navigate("/login");
    } else {
      setUser(savedUser);
    }
  }, [navigate]);

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh!');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước ảnh không được vượt quá 5MB!');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        const updatedUser = { ...user, avatar: base64String };
        setUser(updatedUser);
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));
        setConfirmMessage("Ảnh đại diện đã được cập nhật!");
        setTimeout(() => setConfirmMessage(""), 4000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const updatedUser = { ...user, password };
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    setEditing(false);
    setConfirmMessage("Thông tin của bạn đã được cập nhật thành công!");
    setTimeout(() => setConfirmMessage(""), 4000);
  };

  const handleSaveGoal = () => {
    setEditingGoal(false);
    setAiFeedback("AI đang đưa ra gợi ý phù hợp với mục tiêu của bạn...");
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <Container sx={{ mt: 6, mb: 6 }}>
          <Alert severity="info">Bạn cần đăng nhập để xem trang cá nhân.</Alert>
        </Container>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      {/* Hero Background */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          height: 200,
          position: "relative",
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "100px",
            background: "linear-gradient(to top, #f8fafc, transparent)",
          },
        }}
      />

      <Container sx={{ mt: -18, mb: 6, position: "relative", zIndex: 1 }}>

        {/* ===============     CONTAINER 1     ================== */}
        <Paper
          sx={{
            p: 4,
            borderRadius: 4,
            mb: 4,
            backgroundColor: "#ffffff",
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            border: "1px solid rgba(255,255,255,0.8)",
          }}
        >
          <Box
            display="flex"
            flexDirection={{ xs: "column", md: "row" }}
            gap={4}
            alignItems="center"
          >
            {/* ==== AVATAR ==== */}
            <Box display="flex" flexDirection="column" alignItems="center">
              <Box sx={{ position: "relative" }}>
                <Avatar
                  src={
                    user.avatar ||
                    "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                  }
                  sx={{
                    width: 180,
                    height: 180,
                    mb: 2,
                    border: "4px solid white",
                    boxShadow: "0 8px 24px rgba(102, 126, 234, 0.3)",
                  }}
                />
                <input
                  accept="image/*"
                  id="avatar-upload"
                  type="file"
                  style={{ display: "none" }}
                  onChange={handleAvatarChange}
                />
                <label htmlFor="avatar-upload">
                  <IconButton
                    component="span"
                    sx={{
                      position: "absolute",
                      bottom: 20,
                      right: 0,
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white",
                      width: 40,
                      height: 40,
                      boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                      },
                    }}
                  >
                    <CameraAltIcon fontSize="small" />
                  </IconButton>
                </label>
              </Box>
              <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5 }}>
                {user.fullName || user.userName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                @{user.userName}
              </Typography>
            </Box>

            <Box sx={{ flex: 1, width: "100%" }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h4" fontWeight="bold">
                  Thông tin cá nhân
                </Typography>
                {!editing && (
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    sx={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      textTransform: "none",
                      fontWeight: "bold",
                      borderRadius: 2.5,
                      px: 3,
                      boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                      },
                    }}
                    onClick={() => setEditing(true)}
                  >
                    Chỉnh sửa
                  </Button>
                )}
              </Box>

              {/* Add a decorative divider */}
              <Divider sx={{ mb: 2, borderColor: "#cbd5e1" }} />

              {/* Grid 2 cột × 2 hàng */}
              <Grid container spacing={1.5}>
                {/* Username + Email */}
                <Grid item xs={12} sm={6}>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <TextField
                      label="Tên đăng nhập"
                      value={user.userName}
                      fullWidth
                      disabled
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          backgroundColor: "#f8fafc",
                          minWidth: 420,
                        },
                      }}
                    />
                    <TextField
                      label="Họ và tên"
                      value={user.fullName || ""}
                      onChange={(e) =>
                        setUser({ ...user, fullName: e.target.value })
                      }
                      fullWidth
                      disabled={!editing}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          backgroundColor: editing ? "white" : "#f8fafc",
                          minWidth: 420
                        },
                      }}
                    />
                  </Box>
                </Grid>

                {/* Họ và tên + Mật khẩu */}
                <Grid item xs={12} sm={6}>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <TextField
                      label="Email"
                      value={user.email}
                      fullWidth
                      disabled
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          backgroundColor: "#f8fafc",
                          minWidth: 420,
                        },
                      }}
                    />

                    <TextField
                      label="Mật khẩu mới"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      fullWidth
                      disabled={!editing}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          backgroundColor: editing ? "white" : "#f8fafc",
                          minWidth: 420
                        },
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>

              {editing && (
                <Box display="flex" gap={2} mt={3} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    startIcon={<CloseIcon />}
                    sx={{
                      textTransform: "none",
                      borderColor: "#cbd5e1",
                      color: "#64748b",
                      borderRadius: 2.5,
                      px: 3,
                      "&:hover": {
                        borderColor: "#94a3b8",
                        backgroundColor: "#f8fafc",
                      },
                    }}
                    onClick={() => setEditing(false)}
                  >
                    Hủy
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    sx={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      textTransform: "none",
                      fontWeight: "bold",
                      borderRadius: 2.5,
                      px: 3,
                      boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                      },
                    }}
                    onClick={handleSave}
                  >
                    Lưu thay đổi
                  </Button>
                </Box>
              )}

              {confirmMessage && (
                <Alert
                  severity="success"
                  sx={{
                    mt: 2,
                    borderRadius: 2,
                    boxShadow: "0 4px 12px rgba(34, 197, 94, 0.2)",
                  }}
                >
                  {confirmMessage}
                </Alert>
              )}
            </Box>
          </Box>
        </Paper>

        {/* ===============     CONTAINER 2     ================== */}
        <Paper
          sx={{
            p: 4,
            borderRadius: 4,
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            border: "1px solid rgba(255,255,255,0.8)",
          }}
        >
          <Typography variant="h5" fontWeight="bold" mb={3}>
            Hồ sơ học tập
          </Typography>

          {/* Lịch sử + Theo dõi + Kết quả kiểm tra */}
          <Grid container spacing={2} mb={3} justifyContent={"center"}>
            <Grid item xs={12} sm={4}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<HistoryIcon />}
                sx={{
                  textTransform: "none",
                  fontWeight: "bold",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: 2.5,
                  py: 1.5,
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 16px rgba(102, 126, 234, 0.4)",
                  },
                }}
                onClick={() => navigate("/history")}
              >
                Lịch sử học tập
              </Button>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<FavoriteIcon />}
                sx={{
                  textTransform: "none",
                  fontWeight: "bold",
                  background: "linear-gradient(135deg, #1e3e87ff 0%, #f5576c 100%)",
                  borderRadius: 2.5,
                  py: 1.5,
                  boxShadow: "0 4px 12px rgba(240, 147, 251, 0.3)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "linear-gradient(135deg, #f5576c 0%, #1e3e87ff 100%)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 16px rgba(240, 147, 251, 0.4)",
                  },
                }}
                onClick={() => navigate("/following")}
              >
                Khóa học theo dõi
              </Button>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<AssignmentTurnedInIcon />}
                sx={{
                  textTransform: "none",
                  fontWeight: "bold",
                  background: "linear-gradient(135deg, #187035ff 0%, #206b93ff 100%)",
                  borderRadius: 2.5,
                  py: 1.5,
                  boxShadow: "0 4px 12px rgba(67, 233, 123, 0.3)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "linear-gradient(135deg, #206b93ff 0%, #187035ff 100%)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 16px rgba(67, 233, 123, 0.4)",
                  },
                }}
                onClick={() => navigate("/test-results")}
              >
                Kết quả kiểm tra
              </Button>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Mục tiêu học tập */}
          <Box mb={3}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <EmojiEventsIcon sx={{ color: "#f59e0b", fontSize: 28 }} />
              <Typography variant="h5" fontWeight="bold">
                Mục tiêu học tập
              </Typography>
            </Box>

            <Box display="flex" gap={2} flexDirection={{ xs: "column", sm: "row" }}>
              <TextField
                fullWidth
                placeholder="Nhập mục tiêu của bạn (VD: TOEIC 600)"
                value={learningGoal}
                onChange={(e) => setLearningGoal(e.target.value)}
                disabled={!editingGoal}
                multiline
                rows={1}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2.5,
                    backgroundColor: editingGoal ? "white" : "#f8fafc",
                  },
                }}
              />
              <Button
                variant="contained"
                startIcon={editingGoal ? <SaveIcon /> : <EditIcon />}
                sx={{
                  textTransform: "none",
                  fontWeight: "bold",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: 2.5,
                  px: 2,
                  minWidth: { xs: "100%", sm: 180 },
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                  },
                }}
                onClick={() =>
                  editingGoal ? handleSaveGoal() : setEditingGoal(true)
                }
              >
                {editingGoal ? "Lưu" : "Chỉnh sửa"}
              </Button>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Feedback AI */}
          <Box>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <AutoAwesomeIcon
                sx={{
                  color: "#8b5cf6",
                  fontSize: 28,
                  animation: "pulse 2s infinite",
                  "@keyframes pulse": {
                    "0%, 100%": { opacity: 1 },
                    "50%": { opacity: 0.5 },
                  },
                }}
              />
              <Typography variant="h5" fontWeight="bold">
                Gợi ý từ AI
              </Typography>
            </Box>

            <Paper
              sx={{
                p: 3,
                borderRadius: 2.5,
                background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                border: "2px solid #bae6fd",
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  color: "#0c4a6e",
                  lineHeight: 1.8,
                  fontStyle: "italic",
                }}
              >
                {aiFeedback}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  mt: 2,
                  color: "#64748b",
                }}
              >
                💡 Các khóa học được đề xuất sẽ hiển thị ở đầu trang chủ
              </Typography>
            </Paper>
          </Box>
        </Paper>
      </Container>

      <Footer />
    </>
  );
}