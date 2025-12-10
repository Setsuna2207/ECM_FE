import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { tokens } from "../../../theme";
import Header from "../../../components/Header";
import { useTheme } from "@mui/material/styles";

export default function ManageCategory() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [categories, setCategories] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState({ name: "", description: "" });

  // Dữ liệu mẫu
  useEffect(() => {
    setCategories([
      // LEVEL
      { id: 1, name: "TOEIC", description: "LEVEL" },
      { id: 2, name: "IELTS", description: "LEVEL" },
      { id: 3, name: "TOEFL", description: "LEVEL" },
      { id: 4, name: "GENERAL", description: "LEVEL" },

      // SKILL
      { id: 5, name: "Listening", description: "SKILL" },
      { id: 6, name: "Reading", description: "SKILL" },
      { id: 7, name: "Writing", description: "SKILL" },
      { id: 8, name: "Grammar", description: "SKILL" },
      { id: 9, name: "Vocabulary", description: "SKILL" },
    ]);
  }, []);
  
  const handleAdd = () => {
    setSelectedCategory({ name: "", description: "" });
    setEditMode(false);
    setOpenDialog(true);
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setEditMode(true);
    setOpenDialog(true);
  };

  const handleDelete = (category) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      setCategories((prev) => prev.filter((c) => c.id !== category.id));
    }
  };

  const handleSave = () => {
    if (!selectedCategory.name || !selectedCategory.description) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    if (editMode) {
      setCategories((prev) =>
        prev.map((c) => (c.id === selectedCategory.id ? selectedCategory : c))
      );
    } else {
      const newId = categories.length ? Math.max(...categories.map((c) => c.id)) + 1 : 1;
      setCategories((prev) => [...prev, { ...selectedCategory, id: newId }]);
    }

    setOpenDialog(false);
  };

  // Cột DataGrid
  const columns = [
    { field: "id", headerName: "ID", flex: 0.3, align: "center", headerAlign: "center" },
    { field: "name", headerName: "Tên danh mục", flex: 1, align: "center", headerAlign: "center" },
    {
      field: "description",
      headerName: "Loại danh mục",
      flex: 0.8,
      align: "center",
      headerAlign: "center",
      renderCell: (params) =>
        params.value === "LEVEL" ? "Trình độ" : "Kỹ năng",
    },
    {
      field: "actions",
      headerName: "Hành động",
      flex: 0.6,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <>
          <Button
            color="primary"
            onClick={() => handleEdit(params.row)}
            startIcon={<EditIcon />}
          >
          </Button>
          <Button
            color="error"
            onClick={() => handleDelete(params.row)}
            startIcon={<DeleteIcon />}
          >
          </Button>
        </>
      ),
    },
  ];

  return (
    <Box flex="1" overflow="auto" p={3}>
      {/* Tiêu đề + Nút thêm */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Header title="Quản lý danh mục" subtitle="Danh sách các danh mục Level & Skill" />
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          sx={{ borderRadius: 2, textTransform: "none" }}
          onClick={handleAdd}
        >
          Thêm danh mục
        </Button>
      </Box>

      {/* Bảng DataGrid */}
      <Box
        mt="10px"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.gray[900],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.gray[900],
          },
        }}
      >
        <DataGrid
          rows={categories}
          columns={columns}
          getRowId={(row) => row.id}
          slots={{ toolbar: GridToolbar }}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
        />
      </Box>

      {/* Dialog thêm/sửa */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editMode ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Tên danh mục"
            fullWidth
            value={selectedCategory?.name || ""}
            onChange={(e) =>
              setSelectedCategory({ ...selectedCategory, name: e.target.value })
            }
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Loại danh mục</InputLabel>
            <Select
              value={selectedCategory?.description || ""}
              label="Loại danh mục"
              onChange={(e) =>
                setSelectedCategory({ ...selectedCategory, description: e.target.value })
              }
            >
              <MenuItem value="LEVEL">Trình độ (Level)</MenuItem>
              <MenuItem value="SKILL">Kỹ năng (Skill)</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button variant="contained" color="primary" onClick={handleSave}>
            {editMode ? "Lưu thay đổi" : "Thêm mới"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
