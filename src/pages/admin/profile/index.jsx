import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    Avatar,
    Divider,
    useTheme,
} from "@mui/material";
import { tokens } from "../../../theme";
import Header from "../../../components/Header";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { InputAdornment, IconButton } from "@mui/material";


export default function ManageProfile() {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [showPassword, setShowPassword] = useState(false);
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        userName: "",
        fullName: "",
        email: "",
        password: "",
        avatar: "",
    });
    const [avatarPreview, setAvatarPreview] = useState("");

    // Lấy thông tin người dùng hiện tại từ localStorage
    useEffect(() => {
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        if (currentUser) {
            setUser(currentUser);
            setFormData({
                userName: currentUser.userName || "",
                fullName: currentUser.fullName || "",
                email: currentUser.email || "",
                password: currentUser.password || "",
                avatar: currentUser.avatar || "",
            });
            setAvatarPreview(currentUser.avatar || "");
        }
    }, []);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleAvatarUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result);
            setFormData((prev) => ({ ...prev, avatar: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    const handleSave = () => {
        const updatedUser = {
            ...currentUser,
            ...formData
        };
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));

        // Dispatch custom event to notify other components
        window.dispatchEvent(new Event('userUpdated'));
        window.dispatchEvent(new Event('storage'));

        alert("✅ Cập nhật hồ sơ thành công!");
    };

    return (
        <Box
            display="flex"
            flexDirection="column"
            height="100%"
            p={3}
            sx={{
                overflow: "hidden",
                minHeight: "calc(100vh - 120px)",
            }}
        >

            {/* Heading */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Header title="Hồ sơ quản trị viên" subtitle="Thông tin tài khoản quản trị" />
            </Box>
            <Box
                display="flex"
                alignItems="flex-start"
                justifyContent="center"
                gap={6}
                mt={4}
            >
                <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                    <Avatar
                        src={avatarPreview}
                        alt="User Avatar"
                        sx={{ width: 240, height: 240, mb: 1 }}
                    />
                    <Button
                        variant="outlined"
                        component="label"
                        sx={{
                            borderRadius: 3,
                            textTransform: "none",
                            color: colors.greenAccent[300],
                            borderColor: colors.greenAccent[300],
                            "&:hover": { backgroundColor: colors.primary[400] },
                        }}
                    >
                        Đổi ảnh
                        <input type="file" accept="image/*" hidden onChange={handleAvatarUpload} />
                    </Button>
                </Box>
                <Box
                    display="flex"
                    flexDirection="column"
                    gap={2}
                    sx={{ minWidth: 400 }}
                >
                    <TextField
                        label="Họ và tên"
                        value={formData.fullName}
                        onChange={(e) => handleChange("fullName", e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Tên đăng nhập"
                        value={formData.userName}
                        onChange={(e) => handleChange("userName", e.target.value)}
                        fullWidth
                        disabled
                    />
                    <TextField
                        label="Email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        fullWidth
                        disabled
                    />
                    <TextField
                        label="Mật khẩu"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => handleChange("password", e.target.value)}
                        fullWidth
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
                    <Divider sx={{ my: 1 }} />
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleSave}
                        sx={{
                            alignSelf: "flex-end",
                            borderRadius: 3,
                            textTransform: "none",
                            px: 4,
                        }}
                    >
                        Lưu thay đổi
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}
