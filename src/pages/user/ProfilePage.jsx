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
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
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
import QuizIcon from "@mui/icons-material/Quiz";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { GetUser, UpdateUser, ChangePassword, UpdateAvatar } from "../../services/userService";
import { CreateUserGoal, UpdateUserGoal, GetAllUserGoals } from "../../services/userGoalService";
import { GetActiveLearningPath } from "../../services/learningPathService";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editingGoal, setEditingGoal] = useState(false);
  const [learningGoal, setLearningGoal] = useState("");
  const [userGoalId, setUserGoalId] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [aiFeedback, setAiFeedback] = useState(
    "Thiết lập mục tiêu học tập của bạn để bắt đầu..."
  );
  const [confirmMessage, setConfirmMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, [navigate]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const savedUser = JSON.parse(localStorage.getItem("currentUser"));

      if (!savedUser) {
        navigate("/login");
        return;
      }

      // Fetch fresh user data from backend
      const response = await GetUser(savedUser.userName);
      const userData = response.data;

      // Normalize property names to camelCase for frontend consistency
      const normalizedUser = {
        userID: userData.UserID || userData.UserId || userData.userId || userData.userID,
        userName: userData.UserName || userData.userName,
        email: userData.Email || userData.email,
        fullName: userData.FullName || userData.fullName || "",
        avatar: userData.Avatar || userData.avatar || "",
        roles: userData.Roles || userData.roles || savedUser.roles || "",
      };

      setUser(normalizedUser);

      // Update localStorage with fresh data
      localStorage.setItem("currentUser", JSON.stringify(normalizedUser));

      console.log("ProfilePage - Saved user to localStorage:", normalizedUser);
      console.log("ProfilePage - userID:", normalizedUser.userID);

      // Load learning goal from localStorage
      const goal = localStorage.getItem("learningGoal") || "";
      setLearningGoal(goal);

    } catch (err) {
      console.error("Error fetching user data:", err);
      setErrorMessage("Không thể tải thông tin người dùng");

      // Fallback to localStorage if API fails
      const savedUser = JSON.parse(localStorage.getItem("currentUser"));
      if (savedUser) {
        setUser(savedUser);
      } else {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh!');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước ảnh không được vượt quá 5MB!');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result;

        try {
          setSaving(true);
          setErrorMessage("");

          // Call backend API to update avatar
          await UpdateAvatar(user.userName, base64String);

          // Update local state
          const updatedUser = { ...user, avatar: base64String };
          setUser(updatedUser);
          localStorage.setItem("currentUser", JSON.stringify(updatedUser));

          // Dispatch event to notify other components
          window.dispatchEvent(new Event('userUpdated'));

          setConfirmMessage("Ảnh đại diện đã được cập nhật!");
          setTimeout(() => setConfirmMessage(""), 4000);
        } catch (err) {
          console.error("Error updating avatar:", err);
          setErrorMessage(err.response?.data?.message || "Không thể cập nhật ảnh đại diện");
        } finally {
          setSaving(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setErrorMessage("");

      // Update user info (fullName and avatar)
      const updateData = {
        FullName: user.fullName,
        Avatar: user.avatar,
      };

      await UpdateUser(user.userName, updateData);

      // Change password if provided
      if (currentPassword && newPassword) {
        const passwordData = {
          UserName: user.userName,
          CurrentPassword: currentPassword,
          NewPassword: newPassword,
        };

        await ChangePassword(passwordData);
        setCurrentPassword("");
        setNewPassword("");
      }

      // Update localStorage
      localStorage.setItem("currentUser", JSON.stringify(user));

      // Dispatch event to notify other components
      window.dispatchEvent(new Event('userUpdated'));

      setEditing(false);
      setConfirmMessage("Thông tin của bạn đã được cập nhật thành công!");
      setTimeout(() => setConfirmMessage(""), 4000);
    } catch (err) {
      console.error("Error saving user data:", err);
      setErrorMessage(err.response?.data?.message || "Không thể cập nhật thông tin");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveGoal = async () => {
    try {
      setSaving(true);
      setErrorMessage("");

      // Create or update UserGoal in backend
      let goalResponse;
      if (userGoalId) {
        // Update existing goal
        console.log("[SaveGoal] Updating existing goal:", userGoalId);
        console.log("[SaveGoal] Sending data:", { Content: learningGoal });
        goalResponse = await UpdateUserGoal(userGoalId, { Content: learningGoal });
      } else {
        // Create new goal
        console.log("[SaveGoal] Creating new goal");
        console.log("[SaveGoal] Sending data:", { Content: learningGoal });
        goalResponse = await CreateUserGoal({ Content: learningGoal });
      }

      const goalData = goalResponse.data;
      const newGoalId = goalData.userGoalID || goalData.UserGoalID;
      setUserGoalId(newGoalId);

      console.log("[SaveGoal] Goal saved with ID:", newGoalId);

      setEditingGoal(false);
      setConfirmMessage("✅ Mục tiêu đã được lưu thành công!");
      setTimeout(() => setConfirmMessage(""), 5000);
    } catch (err) {
      console.error("[SaveGoal] Error:", err);
      setErrorMessage(err.response?.data?.message || "Không thể lưu mục tiêu");
    } finally {
      setSaving(false);
    }
  };



  const loadUserGoal = async () => {
    try {
      // First, try to get active learning path (includes goal and AI feedback)
      const learningPathResponse = await GetActiveLearningPath();
      const learningPathData = learningPathResponse.data;

      if (learningPathData && learningPathData.learningPath) {
        const lp = learningPathData.learningPath;
        setLearningGoal(lp.goalContent || "");
        setUserGoalId(lp.userGoalID);

        // Set AI feedback if available
        if (learningPathData.aiFeedback) {
          const feedback = learningPathData.aiFeedback;
          setAiFeedback(feedback.feedbackText || feedback.FeedbackText || "AI sẽ đưa ra gợi ý khóa học dựa trên mục tiêu và năng lực của bạn...");
        }
      } else {
        // No active learning path, try to get user goals
        const response = await GetAllUserGoals();
        const goals = response.data;

        if (goals && goals.length > 0) {
          // Get the most recent goal
          const latestGoal = goals[goals.length - 1];
          setLearningGoal(latestGoal.Content || latestGoal.content || "");
          setUserGoalId(latestGoal.UserGoalID || latestGoal.userGoalID);
        }
      }
    } catch (err) {
      console.error("Error loading user goals:", err);
      // If API fails, user can still set a new goal
    }
  };

  useEffect(() => {
    if (user) {
      loadUserGoal();
    }
  }, [user]);

  if (loading) {
    return (
      <>
        <Navbar />
        <Container sx={{ mt: 6, mb: 6, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Container>
        <Footer />
      </>
    );
  }

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

              {/* Grid 2 columns */}
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

                {/* Email + Mật khẩu */}
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
                      label="Mật khẩu hiện tại"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      fullWidth
                      disabled={!editing}
                      placeholder={editing ? "Nhập để đổi mật khẩu" : ""}
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

              {/* New Password Field - Only show when editing */}
              {editing && (
                <Box mt={2}>
                  <TextField
                    label="Mật khẩu mới"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    fullWidth
                    placeholder="Nhập mật khẩu mới (nếu muốn đổi)"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        backgroundColor: "white",
                      },
                    }}
                  />
                </Box>
              )}

              {/* Error Message */}
              {errorMessage && (
                <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
                  {errorMessage}
                </Alert>
              )}

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
                    startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    disabled={saving}
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
                      "&:disabled": {
                        background: "#cbd5e1",
                      },
                    }}
                    onClick={handleSave}
                  >
                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
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
                onClick={() => navigate("/results")}
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
                placeholder="Nhập mục tiêu của bạn Level + Skill + Score (VD: TOEIC READING 600)"
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