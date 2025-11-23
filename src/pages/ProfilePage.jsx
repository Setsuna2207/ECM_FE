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
} from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

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

      <Container sx={{ mt: 4, mb: 6 }}>
        {/* ====================================================== */}
        {/* ===============     CONTAINER 1     ================== */}
        {/* ====================================================== */}
        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            mb: 4,
            backgroundColor: "#ffffff",
            boxShadow: 3,
          }}
        >
          <Typography variant="h5" fontWeight="bold" mb={3} textAlign="left">
            Thông tin cá nhân
          </Typography>

          <Box
            display="flex"
            flexDirection={{ xs: "column", md: "row" }}
            gap={4}
            justifyContent="center"
            alignItems="center"
          >
            {/* ==== AVATAR ==== */}
            <Box display="flex" flexDirection="column" alignItems="center">
              <Avatar
                src={
                  user.avatar ||
                  "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                }
                sx={{
                  width: 200,
                  height: 200,
                  mb: 1.5,
                  border: "2px solid #6C63FF",
                }}
              />
              <Button
                variant="outlined"
                sx={{
                  textTransform: "none",
                  borderColor: "#6C63FF",
                  color: "#6C63FF",
                  fontWeight: "bold",
                  fontSize: 12,
                  "&:hover": { backgroundColor: "#f3f1ff" },
                }}
              >
                Đổi ảnh đại diện
              </Button>
            </Box>

            {/* ==== THÔNG TIN ==== */}
            <Box display="flex" flexDirection="column" justifyContent="center">
              <Grid container spacing={2}>
                {/* Cột trái: Username + Email */}
                <Grid item xs={12} sm={6} display="flex" flexDirection="column" gap={2}>
                  <TextField
                    label="Tên đăng nhập"
                    value={user.userName}
                    fullWidth
                    disabled
                  />
                  <TextField label="Email" value={user.email} fullWidth disabled />
                </Grid>

                {/* Cột phải: Họ và tên + Mật khẩu */}
                <Grid item xs={12} sm={6} display="flex" flexDirection="column" gap={2}>
                  <TextField
                    label="Họ và tên"
                    value={user.fullName}
                    onChange={(e) =>
                      setUser({ ...user, fullName: e.target.value })
                    }
                    fullWidth
                    disabled={!editing}
                  />
                  <TextField
                    label="Mật khẩu mới"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                    disabled={!editing}
                  />

                  {/* NÚT CHỈNH SỬA / LƯU / HỦY CĂN THEO CỘT MẬT KHẨU */}
                  <Box display="flex" gap={2} mt={2} justifyContent="flex-end" flexWrap="wrap">
                    {editing ? (
                      <>
                        <Button
                          variant="contained"
                          sx={{
                            textTransform: "none",
                            fontWeight: "bold",
                            backgroundColor: "#4038d2ff",
                            "&:hover": { backgroundColor: "#6C63FF" },
                            minWidth: 140,
                          }}
                          onClick={handleSave}
                        >
                          Lưu thay đổi
                        </Button>
                        <Button
                          variant="outlined"
                          sx={{
                            textTransform: "none",
                            borderColor: "#aaa",
                            color: "#555",
                            minWidth: 100,
                          }}
                          onClick={() => setEditing(false)}
                        >
                          Hủy
                        </Button>
                        {confirmMessage && (
                          <Alert sx={{ mt: 1, width: "100%" }} severity="success">
                            {confirmMessage}
                          </Alert>
                        )}
                      </>
                    ) : (
                      <Button
                        variant="contained"
                        sx={{
                          textTransform: "none",
                          fontWeight: "bold",
                          backgroundColor: "#4038d2ff",
                          minWidth: 180,
                          "&:hover": { backgroundColor: "#6C63FF" },
                        }}
                        onClick={() => setEditing(true)}
                      >
                        Chỉnh sửa thông tin
                      </Button>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Paper>

        {/* ====================================================== */}
        {/* ===============     CONTAINER 2     ================== */}
        {/* ====================================================== */}

        <Paper sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h5" fontWeight="bold" mb={3}>
            Hồ sơ học tập
          </Typography>

          {/* Hàng 1 – Lịch sử + Theo dõi */}
          <Box display="flex" gap={2} mb={3}>
            <Button
              fullWidth
              variant="contained"
              sx={{
                textTransform: "none",
                fontWeight: "bold",
                backgroundColor: "#4038d2ff",
                "&:hover": { backgroundColor: "#6C63FF" },
              }}
              onClick={() => navigate("/history")}
            >
              Lịch sử
            </Button>

            <Button
              fullWidth
              variant="contained"
              sx={{
                textTransform: "none",
                fontWeight: "bold",
                backgroundColor: "#4038d2ff",
                "&:hover": { backgroundColor: "#6C63FF" },
              }}
              onClick={() => navigate("/following")}
            >
              Theo dõi
            </Button>
          </Box>

          {/* Hàng 2 – Mục tiêu học tập */}
          <Box display="flex" gap={2} mb={3}>
            <Button
              variant="contained"
              sx={{
                width: 200,
                textTransform: "none",
                fontWeight: "bold",
                backgroundColor: "#4038d2ff",
                "&:hover": { backgroundColor: "#6C63FF" },
              }}
              onClick={() =>
                editingGoal ? handleSaveGoal() : setEditingGoal(true)
              }
            >
              {editingGoal ? "Lưu" : "Mục tiêu học tập"}
            </Button>

            <TextField
              fullWidth
              label="Nhập mục tiêu của bạn"
              value={learningGoal}
              onChange={(e) => setLearningGoal(e.target.value)}
              disabled={!editingGoal}
            />
          </Box>

          {/* Hàng 3 – Feedback AI */}
          <TextField
            fullWidth
            label="Gợi ý từ AI. Các khóa học được đề xuất sẽ hiển thị ở đầu trang chủ."
            multiline
            minRows={6}
            value={aiFeedback}
            disabled
            sx={{ backgroundColor: "#fafafa" }}
          />
        </Paper>
      </Container>

      <Footer />
    </>
  );
}
