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
  CircularProgress,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { tokens } from "../../../theme";
import Header from "../../../components/Header";
import { useTheme } from "@mui/material/styles";
import { GetAllCategory, CreateCategory, UpdateCategory, DeleteCategory } from "../../../services/categoryService";

export default function ManageCategory() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState({ name: "", description: "" });

  // Fetch categories from API
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await GetAllCategory();
      if (response && response.data) {
        // Map API data to match the UI format
        const formattedCategories = response.data.map(cat => ({
          id: cat.categoryID,
          categoryID: cat.categoryID,
          name: cat.name,
          description: cat.description
        }));
        setCategories(formattedCategories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      alert("Không thể tải danh sách danh mục!");
    } finally {
      setLoading(false);
    }
  };

  /* MOCK DATA
  useEffect(() => {
    setCategories([
      { id: 1, name: "TOEIC", description: "LEVEL" },
      { id: 2, name: "IELTS", description: "LEVEL" },
      { id: 3, name: "TOEFL", description: "LEVEL" },
      { id: 4, name: "GENERAL", description: "LEVEL" },
      { id: 5, name: "Listening", description: "SKILL" },
      { id: 6, name: "Reading", description: "SKILL" },
      { id: 7, name: "Writing", description: "SKILL" },
      { id: 8, name: "Grammar", description: "SKILL" },
      { id: 9, name: "Vocabulary", description: "SKILL" },
    ]);
  }, []);
  */
  
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

  const handleDelete = async (category) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      try {
        await DeleteCategory(category.categoryID);
        alert("Xóa danh mục thành công!");
        fetchCategories(); // Reload data
      } catch (error) {
        console.error("Error deleting category:", error);
        alert("Lỗi khi xóa danh mục!");
      }
    }
  };

  const handleSave = async () => {
    if (!selectedCategory.name || !selectedCategory.description) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    try {
      if (editMode) {
        // Update category
        await UpdateCategory(selectedCategory.categoryID, {
          name: selectedCategory.name,
          description: selectedCategory.description
        });
        alert("Cập nhật danh mục thành công!");
      } else {
        // Create new category
        await CreateCategory({
          name: selectedCategory.name,
          description: selectedCategory.description
        });
        alert("Thêm danh mục thành công!");
      }
      setOpenDialog(false);
      fetchCategories(); // Reload data
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Lỗi khi lưu danh mục!");
    }
  };

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
          />
          <Button
            color="error"
            onClick={() => handleDelete(params.row)}
            startIcon={<DeleteIcon />}
          />
        </>
      ),
    },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box flex="1" overflow="auto" p={3}>
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