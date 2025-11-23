import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { mockAccount } from "../../data/mockAccount";
import bgImage from "../../assets/bg.jpg";
import logo from "../../assets/ECM.png";
import { Visibility, VisibilityOff } from "@mui/icons-material";

export default function LoginPage() {
  const [loginInput, setLoginInput] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [currentTime, setCurrentTime] = useState("");
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
    const timer = setInterval(() => setCurrentTime(formatTime()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    const foundUser = mockAccount.find(
      (acc) =>
        (acc.email === loginInput || acc.userName === loginInput) &&
        acc.password === password
    );

    if (!foundUser) {
      setError("Sai tên đăng nhập / email hoặc mật khẩu!");
      return;
    }

    localStorage.setItem("currentUser", JSON.stringify(foundUser));

    if (foundUser.access === "admin") navigate("/admin");
    else navigate("/");
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
      {/* Hộp đăng nhập bên phải */}
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
        {/* Hộp trắng nhỏ gọn */}
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
              sx={{
                width: 100,
              }}
            />
            <Typography
              variant="subtitle2"
              sx={{ color: "black", fontStyle: "italic" }}
            >
              {currentTime}
            </Typography>
          </Box>

          <Typography variant="h5" fontWeight="bold" mb={2}>
            Đăng nhập hệ thống
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2, width: "100%" }}>
              {error}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleLogin} sx={{ width: "100%" }}>
            <TextField
              fullWidth
              label="Tên đăng nhập hoặc Email"
              margin="normal"
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
            />

            <TextField
              fullWidth
              label="Mật khẩu"
              type={showPassword ? "text" : "password"}
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

            {/* Quên mật khẩu + Đăng ký */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mt: 1,
                mb: 2,
              }}
            >
              <Link
                component="button"
                variant="body2"
                underline="hover"
              // onClick={() => alert("Chức năng đang phát triển!")}
              >
                Quên mật khẩu?
              </Link>
              <Link
                component="button"
                variant="body2"
                underline="hover"
                onClick={() => navigate("/register")}
              >
                Đăng ký
              </Link>
            </Box>

            {/* Nút hành động */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                mb: 1,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Đăng nhập
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
