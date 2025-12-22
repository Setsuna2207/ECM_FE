import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  Link,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import bgImage from "../../assets/bg1.jpg";
import logo from "../../assets/ECM.png";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Register } from "../../services/userService";

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    userName: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  //  Hàm định dạng thời gian
  const formatTime = () => {
    const now = new Date();
    const hours = now.getHours() % 12 || 12;
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const ampm = now.getHours() >= 12 ? "PM" : "AM";
    const date = now.toLocaleDateString("vi-VN");
    return `${hours}:${minutes} ${ampm} ${date}`;
  };

  //  Cập nhật thời gian mỗi phút
  useEffect(() => {
    setCurrentTime(formatTime());
    const timer = setInterval(() => {
      setCurrentTime(formatTime());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    if (!form.email || !form.password || !form.fullName || !form.userName) {
      setError("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    setLoading(true);

    try {
      const response = await Register({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        userName: form.userName,
      });

      if (response.status === 200 || response.status === 201) {
        setError("");
        alert("Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.");
        navigate("/login");
      }
    } catch (err) {
      console.error("Register error:", err);
      setError(err.response?.data?.message || "Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Hộp đăng ký bên phải */}
      <Box
        sx={{
          width: { xs: "100%", md: "40%" },
          ml: "auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          pr: { xs: 0, md: 6 },
        }}
      >
        {/* Hộp trắng */}
        <Box
          sx={{
            width: "85%",
            maxWidth: 420,
            bgcolor: "#fff",
            borderRadius: 5,
            boxShadow: "0px 4px 20px rgba(0,0,0,0.15)",
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Logo + Thời gian */}
          <Box
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 0,
            }}
          >
            <Box
              component="img"
              src={logo}
              alt="Logo hệ thống"
              sx={{ width: 100 }}
            />
            <Typography
              variant="subtitle2"
              sx={{ color: "black", fontStyle: "italic" }}
            >
              {currentTime}
            </Typography>
          </Box>

          <Typography variant="h5" fontWeight="bold" mb={2}>
            Đăng ký tài khoản
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2, width: "100%" }}>
              {error}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
            <TextField
              fullWidth
              label="Tên đăng nhập"
              margin="normal"
              value={form.userName}
              onChange={(e) => setForm({ ...form, userName: e.target.value })}
            />
            <TextField
              fullWidth
              label="Email"
              margin="normal"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <TextField
              fullWidth
              label="Mật khẩu"
              type={showPassword ? "text" : "password"}
              margin="normal"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Xác nhận mật khẩu"
              type={showConfirm ? "text" : "password"}
              margin="normal"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirm((prev) => !prev)}
                      edge="end"
                    >
                      {showConfirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Dòng “Đã có tài khoản” */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                mt: 1,
                mb: 2,
              }}
            >
              <Typography variant="body2" sx={{ mr: 0.5 }}>
                Đã có tài khoản?
              </Typography>
              <Link
                component="button"
                variant="body2"
                underline="hover"
                onClick={() => navigate("/login")}
              >
                Đăng nhập
              </Link>
            </Box>

            {/* Nút hành động */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                mb: 1,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              {loading ? <CircularProgress size={24} /> : "Đăng ký"}
            </Button>

            <Button
              variant="outlined"
              fullWidth
              onClick={() => navigate("/")}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Trang chủ
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
