import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  IconButton,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Autocomplete,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { tokens } from "../../../theme";
import Header from "../../../components/Header";
import { mockCourses } from "../../../data/mockCourse";

const ManageCourses = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [courses, setCourses] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const [keyword, setKeyword] = useState("");
  const [selectedFilterCourse, setSelectedFilterCourse] = useState(null);

  const LEVEL_OPTIONS = ["TOEIC", "IELTS", "TOEFL", "GENERAL"];
  const SKILL_OPTIONS = ["Listening", "Reading", "Writing", "Grammar", "Vocabulary"];

  // Load dữ liệu
  useEffect(() => {
    const formatted = mockCourses.map((course, index) => {
      const levelCat = course.categories?.find((c) => c.description === "LEVEL");
      const skillCat = course.categories?.find((c) => c.description === "SKILL");

      return {
        ...course,
        id: course.courseId || index + 1,
        level: levelCat ? levelCat.name : "Không rõ",
        skill: skillCat ? skillCat.name : "Không rõ",
      };
    });
    setCourses(formatted);
  }, []);

  // Filter courses theo TextField
  const filteredCourses =
    selectedFilterCourse && selectedFilterCourse.title
      ? courses.filter((c) => c.title === selectedFilterCourse.title)
      : courses;

  // Thêm khóa học
  const handleAddCourse = () => {
    setSelectedCourse({
      title: "",
      level: "",
      skill: "",
      description: "",
      thumbnail: "",
    });
    setOpenAddDialog(true);
  };

  const handleAddSubmit = () => {
    if (!selectedCourse.title || !selectedCourse.level || !selectedCourse.skill) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    const newCourse = {
      ...selectedCourse,
      id: courses.length + 1,
      courseId: courses.length + 1,
      categories: [
        { name: selectedCourse.level, description: "LEVEL" },
        { name: selectedCourse.skill, description: "SKILL" },
      ],
    };

    setCourses((prev) => [newCourse, ...prev]);
    alert("Thêm khóa học thành công!");
    setOpenAddDialog(false);
  };

  // Chỉnh sửa khóa học
  const handleEdit = (row) => {
    setSelectedCourse({ ...row });
    setOpenEditDialog(true);
  };

  const handleEditSubmit = () => {
    const updated = {
      ...selectedCourse,
      categories: [
        { name: selectedCourse.level, description: "LEVEL" },
        { name: selectedCourse.skill, description: "SKILL" },
      ],
    };

    setCourses((prev) =>
      prev.map((c) => (c.id === selectedCourse.id ? updated : c))
    );
    alert("Cập nhật khóa học thành công!");
    setOpenEditDialog(false);
  };

  // Xóa khóa học
  const handleDelete = (row) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa khóa học này không?")) {
      setCourses((prev) => prev.filter((c) => c.id !== row.id));
      alert("Đã xóa khóa học!");
    }
  };

  // Columns DataGrid
  const columns = [
    { field: "id", headerName: "ID", flex: 0.3, align: "center", headerAlign: "center" },
    { field: "title", headerName: "Tên khóa học", flex: 1.2, headerAlign: "center" },
    { field: "level", headerName: "Trình độ (Level)", flex: 0.8, align: "center", headerAlign: "center" },
    { field: "skill", headerName: "Kỹ năng (Skill)", flex: 0.8, align: "center", headerAlign: "center" },
    {
      field: "thumbnail",
      headerName: "Ảnh minh họa",
      flex: 0.8,
      align: "center",
      renderCell: (params) => (
        <img
          src={params.value}
          alt="thumbnail"
          style={{ width: 80, height: 50, borderRadius: 6, objectFit: "cover", border: "1px solid #ddd" }}
        />
      ),
    },
    {
      field: "description",
      headerName: "Mô tả",
      flex: 2,
      renderCell: (params) => (
        <Box sx={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: "actions",
      headerName: "Hành động",
      flex: 0.6,
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: (params) => (
        <>
          <IconButton onClick={() => handleEdit(params.row)} color="primary">
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row)} color="error">
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <Box p={3}>
      {/* Tiêu đề + Nút thêm */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Header title="Quản lý khóa học" subtitle="Danh sách các khóa học" />
        <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={handleAddCourse} sx={{ borderRadius: 2, textTransform: "none" }}>
          Thêm khóa học
        </Button>
      </Box>

      {/* Autocomplete chọn khóa học để lọc */}
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Autocomplete
          freeSolo
          sx={{ minWidth: 300 }}
          options={courses.map((c) => c.title)}
          value={selectedFilterCourse ? selectedFilterCourse.title : ""}
          onInputChange={(e, value) => {
            setKeyword(value);
            if (value === "") setSelectedFilterCourse(null);
          }}
          onChange={(e, value) => {
            const found = courses.find((c) => c.title === value);
            setSelectedFilterCourse(found || null);
          }}
          renderInput={(params) => <TextField {...params} label="Nhập hoặc chọn khóa học" />}
        />
      </Box>

      {/* DataGrid */}
      <Box mt="10px" height="75vh" maxWidth="100%" sx={{
        "& .MuiDataGrid-root": { border: "none" },
        "& .MuiDataGrid-columnHeaders": { backgroundColor: colors.gray[900], borderBottom: "none" },
        "& .MuiDataGrid-virtualScroller": { backgroundColor: colors.primary[400] },
        "& .MuiDataGrid-footerContainer": { borderTop: "none", backgroundColor: colors.gray[900] },
      }}>
        <DataGrid
          rows={filteredCourses}
          columns={columns}
          getRowId={(row) => row.id}
          selectionModel={selectedRows}
          onRowSelectionModelChange={(ids) => setSelectedRows(ids)}
          slots={{ toolbar: GridToolbar }}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        />
      </Box>

      {/* Dialog Thêm */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Thêm khóa học mới</DialogTitle>
        <DialogContent>
          <TextField margin="dense" label="Tên khóa học" fullWidth value={selectedCourse?.title || ""} onChange={(e) => setSelectedCourse({ ...selectedCourse, title: e.target.value })} />

          <FormControl fullWidth margin="dense">
            <InputLabel>Trình độ (Level)</InputLabel>
            <Select value={selectedCourse?.level || ""} label="Trình độ (Level)" onChange={(e) => setSelectedCourse({ ...selectedCourse, level: e.target.value })}>
              {LEVEL_OPTIONS.map((lvl) => <MenuItem key={lvl} value={lvl}>{lvl}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="dense">
            <InputLabel>Kỹ năng (Skill)</InputLabel>
            <Select value={selectedCourse?.skill || ""} label="Kỹ năng (Skill)" onChange={(e) => setSelectedCourse({ ...selectedCourse, skill: e.target.value })}>
              {SKILL_OPTIONS.map((sk) => <MenuItem key={sk} value={sk}>{sk}</MenuItem>)}
            </Select>
          </FormControl>

          <TextField margin="dense" label="Mô tả" fullWidth multiline rows={3} value={selectedCourse?.description || ""} onChange={(e) => setSelectedCourse({ ...selectedCourse, description: e.target.value })} />
          <TextField margin="dense" label="Link ảnh (Thumbnail)" fullWidth value={selectedCourse?.thumbnail || ""} onChange={(e) => setSelectedCourse({ ...selectedCourse, thumbnail: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Hủy</Button>
          <Button variant="contained" color="primary" onClick={handleAddSubmit}>Thêm</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Chỉnh sửa */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Chỉnh sửa khóa học</DialogTitle>
        <DialogContent>
          <TextField margin="dense" label="Tên khóa học" fullWidth value={selectedCourse?.title || ""} onChange={(e) => setSelectedCourse({ ...selectedCourse, title: e.target.value })} />

          <FormControl fullWidth margin="dense">
            <InputLabel>Trình độ (Level)</InputLabel>
            <Select value={selectedCourse?.level || ""} label="Trình độ (Level)" onChange={(e) => setSelectedCourse({ ...selectedCourse, level: e.target.value })}>
              {LEVEL_OPTIONS.map((lvl) => <MenuItem key={lvl} value={lvl}>{lvl}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="dense">
            <InputLabel>Kỹ năng (Skill)</InputLabel>
            <Select value={selectedCourse?.skill || ""} label="Kỹ năng (Skill)" onChange={(e) => setSelectedCourse({ ...selectedCourse, skill: e.target.value })}>
              {SKILL_OPTIONS.map((sk) => <MenuItem key={sk} value={sk}>{sk}</MenuItem>)}
            </Select>
          </FormControl>

          <TextField margin="dense" label="Mô tả" fullWidth multiline rows={3} value={selectedCourse?.description || ""} onChange={(e) => setSelectedCourse({ ...selectedCourse, description: e.target.value })} />
          <TextField margin="dense" label="Link ảnh (Thumbnail)" fullWidth value={selectedCourse?.thumbnail || ""} onChange={(e) => setSelectedCourse({ ...selectedCourse, thumbnail: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Hủy</Button>
          <Button variant="contained" color="primary" onClick={handleEditSubmit}>Lưu thay đổi</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageCourses;
