import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  useTheme,
  Alert,
  CircularProgress,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Header from "../../../components/Header";
import { tokens } from "../../../theme";
import { GetAllUsers, AddUser, UpdateUser, DeleteUser } from "../../../services/userService";

export default function ManageUser() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Lấy thông tin người đăng nhập hiện tại
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // Fetch all users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await GetAllUsers();
      const users = response.data.data || response.data || [];

      const formatted = Array.isArray(users) ? users.map((user, index) => ({
        ...user,
        id: user.userId || user.id || index + 1,
      })) : [];

      setAccounts(formatted);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError("Không thể tải danh sách người dùng!");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedAccount({
      userName: "",
      password: "",
      fullName: "",
      email: "",
      avatar: "",
      roles: "User",
    });
    setIsEditMode(false);
    setOpenDialog(true);
  };

  const handleEdit = (row) => {
    setSelectedAccount({ ...row });
    setIsEditMode(true);
    setOpenDialog(true);
  };

  const handleDelete = async (row) => {
    if (window.confirm("Bạn có chắc muốn xóa tài khoản này không?")) {
      try {
        setLoading(true);
        await DeleteUser(row.userName);
        setAccounts((prev) => prev.filter((acc) => acc.id !== row.id));
        alert("Đã xóa tài khoản!");
      } catch (err) {
        console.error("Delete error:", err);
        alert(err.response?.data?.message || "Lỗi khi xóa tài khoản!");
      } finally {
        setLoading(false);
      }
    }
  };

const handleSave = async () => {
  if (!selectedAccount.userName || !selectedAccount.email) {
    alert("Vui lòng nhập tên đăng nhập và email!");
    return;
  }

  try {
    setLoading(true);

    if (isEditMode) {
      await UpdateUser(selectedAccount.userName, {
        fullName: selectedAccount.fullName,
        email: selectedAccount.email,
        avatar: selectedAccount.avatar,
        roles: selectedAccount.roles,
        ...(selectedAccount.password && { password: selectedAccount.password }),
      });
    } else {
      await AddUser({
        userName: selectedAccount.userName,
        password: selectedAccount.password,
        fullName: selectedAccount.fullName,
        email: selectedAccount.email,
        avatar: selectedAccount.avatar,
        roles: selectedAccount.roles,
      });
    }

    await fetchUsers();

    // If editing current user, update localStorage
    if (currentUser && currentUser.userName === selectedAccount.userName) {
      const updatedCurrentUser = {
        ...currentUser,
        fullName: selectedAccount.fullName,
        email: selectedAccount.email,
        avatar: selectedAccount.avatar,
        roles: selectedAccount.roles,
      };
      
      console.log("🔍 ManageUser - Updating current user:", updatedCurrentUser);
      
      localStorage.setItem("currentUser", JSON.stringify(updatedCurrentUser));
      
      // Dispatch event to notify other components
      window.dispatchEvent(new Event('userUpdated'));
    }

    alert(isEditMode ? "Đã cập nhật tài khoản!" : "Đã thêm tài khoản mới!");
    setOpenDialog(false);
  } catch (err) {
    console.error("Save error:", err);
    alert(err.response?.data?.message || "Lỗi khi lưu tài khoản!");
  } finally {
    setLoading(false);
  }
};

  // Cấu hình cột
  const columns = [
    {
      field: "avatar",
      headerName: "Avatar",
      flex: 0.3,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <Avatar src={params.value} alt={params.row.fullName} />
      ),
    },
    { field: "userName", headerName: "Tên đăng nhập", flex: 0.5, align: "center", headerAlign: "center" },
    { field: "fullName", headerName: "Họ và tên", flex: 0.6, align: "center", headerAlign: "center" },
    { field: "email", headerName: "Email", flex: 1.2, align: "center", headerAlign: "center" },
    {
      field: "roles",
      headerName: "Quyền truy cập",
      flex: 0.6,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "createdAt",
      headerName: "Ngày tạo",
      flex: 0.8,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "actions",
      headerName: "Hành động",
      flex: 0.5,
      headerAlign: "center",
      align: "center",
      sortable: false,
      renderCell: (params) => (
        <>
          <IconButton color="primary" onClick={() => handleEdit(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton color="error" onClick={() => handleDelete(params.row)}>
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

  const isSelf = currentUser && selectedAccount && currentUser.userName === selectedAccount.userName;

  return (
    <Box flex="1" overflow="auto" p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Header title="Quản lý tài khoản" subtitle="Danh sách người dùng hệ thống" />
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          disabled={loading}
          sx={{ borderRadius: 2, textTransform: "none" }}
        >
          Thêm tài khoản
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box
        mt="10px"
        height="70vh"
        sx={{
          "& .MuiDataGrid-columnHeaders": { backgroundColor: colors.gray[900] },
          "& .MuiDataGrid-virtualScroller": { backgroundColor: colors.primary[400] },
        }}
      >
        <DataGrid
          rows={accounts}
          columns={columns}
          getRowId={(row) => row.id}
          slots={{ toolbar: GridToolbar }}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
        />
      </Box>

      {/* 🔹 Dialog thêm / sửa */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>{isEditMode ? "Chỉnh sửa tài khoản" : "Thêm tài khoản mới"}</DialogTitle>
        <DialogContent>
          {/* 🔸 Nếu đang sửa chính mình → cho phép chỉnh */}
          <TextField
            margin="dense"
            label="Tên đăng nhập"
            fullWidth
            value={selectedAccount?.userName || ""}
            disabled
          />
          <TextField
            margin="dense"
            label="Mật khẩu"
            type="password"
            fullWidth
            value={selectedAccount?.password || ""}
            onChange={(e) =>
              setSelectedAccount({ ...selectedAccount, password: e.target.value })
            }
            disabled={isEditMode && !isSelf}
          />
          <TextField
            margin="dense"
            label="Họ và tên"
            fullWidth
            value={selectedAccount?.fullName || ""}
            onChange={(e) =>
              setSelectedAccount({ ...selectedAccount, fullName: e.target.value })
            }
            disabled={isEditMode && !isSelf}
          />
          <TextField
            margin="dense"
            label="Email"
            fullWidth
            value={selectedAccount?.email || ""}
            onChange={(e) =>
              setSelectedAccount({ ...selectedAccount, email: e.target.value })
            }
            disabled={isEditMode && !isSelf}
          />

          <TextField
            select
            margin="dense"
            label="Phân quyền"
            fullWidth
            value={selectedAccount?.roles || "User"}
            onChange={(e) =>
              setSelectedAccount({ ...selectedAccount, roles: e.target.value })
            }
            disabled={isSelf} // 🔸 Không cho đổi quyền của chính mình
          >
            <MenuItem value="Admin">Admin</MenuItem>
            <MenuItem value="User">User</MenuItem>
          </TextField>

          <TextField
            margin="dense"
            label="Ảnh đại diện (URL)"
            fullWidth
            value={selectedAccount?.avatar || ""}
            onChange={(e) =>
              setSelectedAccount({ ...selectedAccount, avatar: e.target.value })
            }
            disabled={isEditMode && !isSelf}
          />
          {selectedAccount?.avatar && (
            <Box mt={2} display="flex" justifyContent="center">
              <Avatar src={selectedAccount.avatar} sx={{ width: 80, height: 80 }} />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={loading}
          >
            Lưu thay đổi
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
