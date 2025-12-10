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
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Header from "../../../components/Header";
import { mockAccount } from "../../../data/mockAccount";
import { tokens } from "../../../theme";

export default function ManageUser() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Lấy thông tin người đăng nhập hiện tại
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  useEffect(() => {
    const formatted = mockAccount.map((acc, index) => ({
      ...acc,
      id: acc.userId || index + 1,
    }));
    setAccounts(formatted);
  }, []);

  const handleAdd = () => {
    setSelectedAccount({
      userName: "",
      password: "",
      fullName: "",
      email: "",
      avatar: "",
      access: "user",
    });
    setIsEditMode(false);
    setOpenDialog(true);
  };

  const handleEdit = (row) => {
    setSelectedAccount({ ...row });
    setIsEditMode(true);
    setOpenDialog(true);
  };

  const handleDelete = (row) => {
    if (window.confirm("Bạn có chắc muốn xóa tài khoản này không?")) {
      setAccounts((prev) => prev.filter((acc) => acc.id !== row.id));
      alert("Đã xóa tài khoản!");
    }
  };

  const handleSave = () => {
    if (!selectedAccount.userName || !selectedAccount.email) {
      alert("Vui lòng nhập tên đăng nhập và email!");
      return;
    }

    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === selectedAccount.id ? selectedAccount : acc
      )
    );

    // Nếu sửa chính mình thì cập nhật vào localStorage
    if (currentUser && currentUser.userId === selectedAccount.userId) {
      localStorage.setItem("currentUser", JSON.stringify(selectedAccount));
    }

    alert("Đã cập nhật tài khoản!");
    setOpenDialog(false);
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
      field: "access",
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

  const isSelf = currentUser && selectedAccount && currentUser.userId === selectedAccount.userId;

  return (
    <Box flex="1" overflow="auto" p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Header title="Quản lý tài khoản" subtitle="Danh sách người dùng hệ thống" />
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          sx={{ borderRadius: 2, textTransform: "none" }}
        >
          Thêm tài khoản
        </Button>
      </Box>

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
            disabled={!isSelf}
          />
          <TextField
            margin="dense"
            label="Họ và tên"
            fullWidth
            value={selectedAccount?.fullName || ""}
            onChange={(e) =>
              setSelectedAccount({ ...selectedAccount, fullName: e.target.value })
            }
            disabled={!isSelf}
          />
          <TextField
            margin="dense"
            label="Email"
            fullWidth
            value={selectedAccount?.email || ""}
            onChange={(e) =>
              setSelectedAccount({ ...selectedAccount, email: e.target.value })
            }
            disabled={!isSelf}
          />

          <TextField
            select
            margin="dense"
            label="Phân quyền"
            fullWidth
            value={selectedAccount?.access || "user"}
            onChange={(e) =>
              setSelectedAccount({ ...selectedAccount, access: e.target.value })
            }
            disabled={isSelf} // 🔸 Không cho đổi quyền của chính mình
          >
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="user">User</MenuItem>
          </TextField>

          <TextField
            margin="dense"
            label="Ảnh đại diện (URL)"
            fullWidth
            value={selectedAccount?.avatar || ""}
            onChange={(e) =>
              setSelectedAccount({ ...selectedAccount, avatar: e.target.value })
            }
            disabled={!isSelf}
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
            disabled={!isSelf && !isEditMode}
          >
            Lưu thay đổi
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
