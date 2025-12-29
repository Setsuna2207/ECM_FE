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
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import bgImage from "../../assets/bg.jpg";
import logo from "../../assets/ECM.png";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Login, GetUser } from "../../services/userService";
import ForgotPassword from "./ForgotPassword";

export default function LoginPage() {
  const [loginInput, setLoginInput] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const navigate = useNavigate();

  const formatTime = () => {
    const now = new Date();
    const hours = now.getHours() % 12 || 12;
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const ampm = now.getHours() >= 12 ? "PM" : "AM";
    const date = now.toLocaleDateString("vi-VN");
    return `${hours}:${minutes} ${ampm} ${date}`;
  };

  useEffect(() => {
    setCurrentTime(formatTime());
    const timer = setInterval(() => setCurrentTime(formatTime()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const isEmail = loginInput.includes("@");

      const loginResponse = await Login({
        userName: !isEmail ? loginInput : undefined,
        email: isEmail ? loginInput : undefined,
        password: password,
      });

      if (loginResponse.status === 200) {
        // Get user data directly from login response
        let userData = loginResponse.data;

        // Handle different response structures
        if (Array.isArray(userData)) userData = userData[0];
        if (userData.data) userData = userData.data;

        console.log("Complete user data from login:", userData);
        console.log("Avatar:", userData?.avatar);
        console.log("Roles:", userData?.roles);

        // Store token if present (handle both PascalCase and camelCase)
        if (userData.Token || userData.token || userData.accessToken) {
          const token = userData.Token || userData.token || userData.accessToken;
          localStorage.setItem("access_token", token);
          console.log("Token saved to localStorage:", token ? "YES" : "NO");
          console.log("Token preview:", token?.substring(0, 50) + "...");
        } else {
          console.error("⚠️ NO TOKEN FOUND IN LOGIN RESPONSE!");
          console.error("User data keys:", Object.keys(userData));
        }

        // Store complete user data (remove token from user object if present)
        const userDataToStore = { ...userData };
        delete userDataToStore.Token;
        delete userDataToStore.token;
        delete userDataToStore.accessToken;

        // Normalize to camelCase for frontend consistency
        const normalizedUser = {
          userID: userDataToStore.UserID || userDataToStore.userID || userDataToStore.userId,
          userName: userDataToStore.UserName || userDataToStore.userName,
          email: userDataToStore.Email || userDataToStore.email,
          fullName: userDataToStore.FullName || userDataToStore.fullName || "",
          avatar: userDataToStore.Avatar || userDataToStore.avatar || "",
          roles: userDataToStore.Roles || userDataToStore.roles || "",
        };

        console.log("User data to store:", normalizedUser);
        console.log("User data keys:", Object.keys(normalizedUser));
        console.log("userID in data:", normalizedUser.userID);

        localStorage.setItem("currentUser", JSON.stringify(normalizedUser));

        // Verify
        const saved = JSON.parse(localStorage.getItem("currentUser"));
        console.log("Saved to localStorage:", saved);
        console.log("Saved userID:", saved?.userID);
        console.log("Avatar saved:", saved?.avatar);

        // Dispatch event
        window.dispatchEvent(new Event('userUpdated'));

        // Redirect based on role
        if (userData.roles === "Admin" || userData.role === "Admin" || userData.access === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      setError(err.response?.data?.message || "Sai tên đăng nhập / email hoặc mật khẩu!");
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
            Đăng nhập hệ thống
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2, width: "100%" }}>
              {error}
            </Alert>
          )}

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
                onClick={(e) => {
                  e.preventDefault();
                  setForgotPasswordOpen(true);
                }}
              >
                Quên mật khẩu?
              </Link>
              <Link
                component="button"
                variant="body2"
                underline="hover"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/register");
                }}
              >
                Đăng ký
              </Link>
            </Box>

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
              {loading ? <CircularProgress size={24} /> : "Đăng nhập"}
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

      <ForgotPassword
        open={forgotPasswordOpen}
        handleClose={() => setForgotPasswordOpen(false)}
      />
    </Box>
  );
}