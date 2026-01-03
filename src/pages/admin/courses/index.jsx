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
  CircularProgress,
  Typography,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { tokens } from "../../../theme";
import Header from "../../../components/Header";
import { GetAllCourses, CreateCourse, UpdateCourse, DeleteCourse } from "../../../services/courseService";
import { GetAllCategory } from "../../../services/categoryService";
import { convertGoogleDriveUrl } from "../../../utils/imageUtils";
import { UploadFile } from "../../../services/fileUploadService";

const ManageCourses = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [courses, setCourses] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [categoryMap, setCategoryMap] = useState({});
  const [levelOptions, setLevelOptions] = useState([]);
  const [skillOptions, setSkillOptions] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [selectedFilterCourse, setSelectedFilterCourse] = useState(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  // Load categories and courses from backend
  useEffect(() => {
    const loadData = async () => {
      await fetchCategories();
      await fetchCourses();
    };
    loadData();
  }, []);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await GetAllCategory();

      console.log("=== Category API Response ===");
      console.log("Full response:", response);
      console.log("Response data:", response.data);
      console.log("First category sample:", response.data?.[0]);

      if (Array.isArray(response.data) && response.data.length > 0) {
        setAllCategories(response.data);

        const map = {};
        const levels = [];
        const skills = [];

        response.data.forEach((cat) => {
          console.log("Processing category:", cat);

          // Try different field name variations
          const catId = cat.categoryID || cat.id || cat.categoryId;
          const catName = cat.Name || cat.name;
          const catDesc = cat.Description || cat.description || cat.type;

          console.log(`Extracted: ID=${catId}, Name=${catName}, Desc=${catDesc}`);

          if (catName && catId) {
            map[catName] = catId;

            if (catDesc === "LEVEL") {
              levels.push(catName);
            } else if (catDesc === "SKILL") {
              skills.push(catName);
            }
          }
        });

        console.log("Final map:", map);
        console.log("Levels:", levels);
        console.log("Skills:", skills);

        setCategoryMap(map);
        setLevelOptions(levels);
        setSkillOptions(skills);
      } else {
        console.warn("No categories found or invalid response format");
      }
    } catch (error) {
      console.error("Lỗi khi tải danh mục:", error);
      alert("Không thể tải danh mục!");
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await GetAllCourses();

      console.log("Courses API response:", response);

      if (!response.data || !Array.isArray(response.data)) {
        console.error("Invalid response format:", response);
        setCourses([]);
        return;
      }

      const formatted = response.data.map((course, index) => {
        const levelCat = course.categories?.find((c) => c.description === "LEVEL");
        const skillCat = course.categories?.find((c) => c.description === "SKILL");

        return {
          id: course.courseID || course.courseId || index + 1,
          courseId: course.courseID || course.courseId,
          title: course.title || "",
          description: course.description || "",
          thumbnail: course.thumbnailUrl || "https://picsum.photos/300/200",
          level: levelCat ? levelCat.name : "",
          skill: skillCat ? skillCat.name : "",
          categories: course.categories || [],
          levelCategoryId: levelCat ? levelCat.categoryID : null,
          skillCategoryId: skillCat ? skillCat.categoryID : null,
        };
      });

      console.log("Formatted courses:", formatted);
      setCourses(formatted);
    } catch (error) {
      console.error("Lỗi khi tải khóa học:", error);
      console.error("Error details:", error.response?.data);
      alert("Không thể tải danh sách khóa học! Vui lòng kiểm tra console để biết chi tiết.");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get category ID
  const getCategoryId = (categoryName) => {
    if (categoryMap[categoryName]) {
      return categoryMap[categoryName];
    }

    // Fallback: search in allCategories
    const cat = allCategories.find(c => c.Name === categoryName);
    return cat ? cat.categoryID : null;
  };

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
    setThumbnailPreview(null);
    setOpenAddDialog(true);
  };

  // Handle thumbnail upload
  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Vui lòng chọn file ảnh (JPG, PNG, GIF, WEBP)');
      e.target.value = '';
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('Kích thước ảnh tối đa là 10MB');
      e.target.value = '';
      return;
    }

    try {
      setUploadingThumbnail(true);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload to server
      const response = await UploadFile(file, "image");

      setSelectedCourse(prev => ({
        ...prev,
        thumbnail: response.data.url
      }));

      alert('✅ Tải ảnh thành công!');
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      alert('❌ Không thể tải ảnh lên. Vui lòng thử lại!');
      setThumbnailPreview(null);
    } finally {
      setUploadingThumbnail(false);
      e.target.value = '';
    }
  };

  const handleAddSubmit = async () => {
    if (!selectedCourse.title || !selectedCourse.level || !selectedCourse.skill) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    try {
      const categoryIds = [];

      const levelId = getCategoryId(selectedCourse.level);
      const skillId = getCategoryId(selectedCourse.skill);

      if (levelId) {
        categoryIds.push(levelId);
      }

      if (skillId) {
        categoryIds.push(skillId);
      }

      if (categoryIds.length < 2) {
        alert("Không thể tìm thấy danh mục. Vui lòng kiểm tra lại.");
        return;
      }

      const newCourseData = {
        title: selectedCourse.title,
        description: selectedCourse.description,
        thumbnailUrl: selectedCourse.thumbnail || "https://picsum.photos/300/200",
        categoryIDs: categoryIds,
        createdAt: new Date().toISOString(),
      };

      await CreateCourse(newCourseData);
      alert("Thêm khóa học thành công!");
      setOpenAddDialog(false);
      fetchCourses();
    } catch (error) {
      console.error("Lỗi khi thêm khóa học:", error);
      const errorMsg = error.response?.data?.message || error.message || "Không thể thêm khóa học!";
      alert(`Lỗi: ${errorMsg}`);
    }
  };

  // Chỉnh sửa khóa học
  const handleEdit = (row) => {
    // Ensure the values are valid options
    const validLevel = levelOptions.includes(row.level) ? row.level : "";
    const validSkill = skillOptions.includes(row.skill) ? row.skill : "";

    setSelectedCourse({
      ...row,
      level: validLevel,
      skill: validSkill
    });

    // Set thumbnail preview if exists
    if (row.thumbnail) {
      setThumbnailPreview(convertGoogleDriveUrl(row.thumbnail));
    } else {
      setThumbnailPreview(null);
    }

    setOpenEditDialog(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedCourse.title || !selectedCourse.level || !selectedCourse.skill) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    try {
      const categoryIds = [];

      // Preserve existing categories that aren't LEVEL or SKILL
      if (selectedCourse.categories && Array.isArray(selectedCourse.categories)) {
        selectedCourse.categories.forEach((cat) => {
          if (cat.description !== "LEVEL" && cat.description !== "SKILL" && cat.categoryID) {
            categoryIds.push(cat.categoryID);
          }
        });
      }

      // Add the LEVEL category ID (replace old one)
      const levelId = getCategoryId(selectedCourse.level);
      if (levelId && !categoryIds.includes(levelId)) {
        categoryIds.push(levelId);
      }

      // Add the SKILL category ID (replace old one)
      const skillId = getCategoryId(selectedCourse.skill);
      if (skillId && !categoryIds.includes(skillId)) {
        categoryIds.push(skillId);
      }

      if (categoryIds.length < 2) {
        alert("Không thể tìm thấy danh mục. Vui lòng kiểm tra lại.");
        return;
      }

      const updatedData = {
        title: selectedCourse.title,
        description: selectedCourse.description,
        thumbnailUrl: selectedCourse.thumbnail || "",
        categoryIDs: categoryIds,
      };

      await UpdateCourse(selectedCourse.courseId, updatedData);
      alert("Cập nhật khóa học thành công!");
      setOpenEditDialog(false);
      fetchCourses();
    } catch (error) {
      console.error("Lỗi khi cập nhật khóa học:", error);
      const errorMsg = error.response?.data?.message || error.message || "Không thể cập nhật khóa học!";
      alert(`Lỗi: ${errorMsg}`);
    }
  };

  // Xóa khóa học
  const handleDelete = async (row) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa khóa học này không?")) {
      try {
        await DeleteCourse(row.courseId);
        alert("Đã xóa khóa học!");
        fetchCourses();
      } catch (error) {
        console.error("Lỗi khi xóa khóa học:", error);
        const errorMsg = error.response?.data?.message || error.message || "Không thể xóa khóa học!";
        alert(`Lỗi: ${errorMsg}`);
      }
    }
  };

  // Columns DataGrid
  const columns = [
    {
      field: "id",
      headerName: "ID",
      flex: 0.3,
      align: "center",
      headerAlign: "center",
      valueGetter: (value, row) => row.id || row.courseId || "N/A"
    },
    {
      field: "title",
      headerName: "Tên khóa học",
      flex: 1.2,
      headerAlign: "center",
      valueGetter: (value, row) => row.title || "Chưa có tên"
    },
    {
      field: "level",
      headerName: "Trình độ (Level)",
      flex: 0.8,
      align: "center",
      headerAlign: "center",
      valueGetter: (value, row) => row.level || "N/A"
    },
    {
      field: "skill",
      headerName: "Kỹ năng (Skill)",
      flex: 0.8,
      align: "center",
      headerAlign: "center",
      valueGetter: (value, row) => row.skill || "N/A"
    },
    {
      field: "description",
      headerName: "Mô tả",
      flex: 2,
      renderCell: (params) => (
        <Box sx={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {params.row.description || "Chưa có mô tả"}
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
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          onClick={handleAddCourse}
          disabled={categoriesLoading}
          sx={{ borderRadius: 2, textTransform: "none" }}
        >
          {categoriesLoading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
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
      <Box
        mt="10px"
        height="75vh"
        maxWidth="100%"
        sx={{
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-columnHeaders": { backgroundColor: colors.gray[900], borderBottom: "none" },
          "& .MuiDataGrid-virtualScroller": { backgroundColor: colors.primary[400] },
          "& .MuiDataGrid-footerContainer": { borderTop: "none", backgroundColor: colors.gray[900] },
        }}
      >
        {courses.length === 0 && !loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
            flexDirection="column"
            gap={2}
          >
            <p>Không có khóa học nào</p>
            <Button
              variant="contained"
              color="primary"
              onClick={fetchCourses}
            >
              Tải lại
            </Button>
          </Box>
        ) : (
          <DataGrid
            loading={loading}
            rows={filteredCourses}
            columns={columns}
            getRowId={(row) => row.id}
            checkboxSelection
            onRowSelectionModelChange={(ids) => setSelectedRows(ids)}
            slots={{ toolbar: GridToolbar }}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 }
              }
            }}
            pageSizeOptions={[5, 10, 25, 50]}
          />
        )}
      </Box>

      {/* Dialog Thêm */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Thêm khóa học mới</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Tên khóa học"
            fullWidth
            value={selectedCourse?.title || ""}
            onChange={(e) => setSelectedCourse({ ...selectedCourse, title: e.target.value })}
          />

          <FormControl fullWidth margin="dense">
            <InputLabel>Trình độ (Level)</InputLabel>
            <Select
              value={selectedCourse?.level || ""}
              label="Trình độ (Level)"
              onChange={(e) => setSelectedCourse({ ...selectedCourse, level: e.target.value })}
            >
              {levelOptions.map((lvl) => (
                <MenuItem key={lvl} value={lvl}>{lvl}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="dense">
            <InputLabel>Kỹ năng (Skill)</InputLabel>
            <Select
              value={selectedCourse?.skill || ""}
              label="Kỹ năng (Skill)"
              onChange={(e) => setSelectedCourse({ ...selectedCourse, skill: e.target.value })}
            >
              {skillOptions.map((sk) => (
                <MenuItem key={sk} value={sk}>{sk}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            margin="dense"
            label="Mô tả"
            fullWidth
            multiline
            rows={3}
            value={selectedCourse?.description || ""}
            onChange={(e) => setSelectedCourse({ ...selectedCourse, description: e.target.value })}
          />

          {/* Thumbnail Upload */}
          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Ảnh minh họa (Thumbnail)
            </Typography>

            {thumbnailPreview && (
              <Box sx={{ mb: 2, textAlign: 'center' }}>
                <img
                  src={thumbnailPreview}
                  alt="Preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '200px',
                    borderRadius: '8px',
                    border: '2px solid #e0e0e0'
                  }}
                />
              </Box>
            )}

            <Button
              variant="outlined"
              component="label"
              fullWidth
              disabled={uploadingThumbnail}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                borderStyle: 'dashed',
                py: 1.5
              }}
            >
              {uploadingThumbnail ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Đang tải lên...
                </>
              ) : (
                <>
                  {thumbnailPreview ? '📷 Thay đổi ảnh' : '📷 Tải ảnh lên'}
                </>
              )}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleThumbnailUpload}
                disabled={uploadingThumbnail}
              />
            </Button>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Định dạng: JPG, PNG, GIF, WEBP (Tối đa 5MB)
            </Typography>
          </Box>
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
          <TextField
            margin="dense"
            label="Tên khóa học"
            fullWidth
            value={selectedCourse?.title || ""}
            onChange={(e) => setSelectedCourse({ ...selectedCourse, title: e.target.value })}
          />

          <FormControl fullWidth margin="dense">
            <InputLabel>Trình độ (Level)</InputLabel>
            <Select
              value={selectedCourse?.level || ""}
              label="Trình độ (Level)"
              onChange={(e) => setSelectedCourse({ ...selectedCourse, level: e.target.value })}
            >
              {levelOptions.map((lvl) => (
                <MenuItem key={lvl} value={lvl}>{lvl}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="dense">
            <InputLabel>Kỹ năng (Skill)</InputLabel>
            <Select
              value={selectedCourse?.skill || ""}
              label="Kỹ năng (Skill)"
              onChange={(e) => setSelectedCourse({ ...selectedCourse, skill: e.target.value })}
            >
              {skillOptions.map((sk) => (
                <MenuItem key={sk} value={sk}>{sk}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            margin="dense"
            label="Mô tả"
            fullWidth
            multiline
            rows={3}
            value={selectedCourse?.description || ""}
            onChange={(e) => setSelectedCourse({ ...selectedCourse, description: e.target.value })}
          />

          {/* Thumbnail Upload */}
          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Ảnh minh họa (Thumbnail)
            </Typography>

            {thumbnailPreview && (
              <Box sx={{ mb: 2, textAlign: 'center' }}>
                <img
                  src={thumbnailPreview}
                  alt="Preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '200px',
                    borderRadius: '8px',
                    border: '2px solid #e0e0e0'
                  }}
                />
              </Box>
            )}

            <Button
              variant="outlined"
              component="label"
              fullWidth
              disabled={uploadingThumbnail}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                borderStyle: 'dashed',
                py: 1.5
              }}
            >
              {uploadingThumbnail ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Đang tải lên...
                </>
              ) : (
                <>
                  {thumbnailPreview ? '📷 Thay đổi ảnh' : '📷 Tải ảnh lên'}
                </>
              )}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleThumbnailUpload}
                disabled={uploadingThumbnail}
              />
            </Button>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Định dạng: JPG, PNG, GIF, WEBP (Tối đa 5MB)
            </Typography>
          </Box>
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
