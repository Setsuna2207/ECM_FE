import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  useTheme,
  Autocomplete,
  Chip,
  Stack,
  Paper,
  Tooltip,
  Badge,
  Divider,
  alpha,
  CircularProgress,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import SlideshowIcon from "@mui/icons-material/Slideshow";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { tokens } from "../../../theme";
import Header from "../../../components/Header";
// import { mockLessons } from "../../../data/mockLesson";
// import { mockCourses } from "../../../data/mockCourse";

import {
  GetAllLessons,
  GetLessonById,
  GetLessonByCourseId,
  CreateLesson,
  UpdateLesson,
  DeleteLesson,
} from "../../../services/lessonService";

import {
  GetAllCourses,
  GetCourseById,
} from "../../../services/courseService";

export default function ManageLessons() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // State management
  const [lessons, setLessons] = useState([]);
  const [courses, setCourses] = useState([]); // Backend courses data
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);

  // Preview states
  const [previewVideoUrl, setPreviewVideoUrl] = useState(null);
  const [openPreviewVideoDialog, setOpenPreviewVideoDialog] = useState(false);
  const [previewFileUrl, setPreviewFileUrl] = useState(null);
  const [openPreviewFileDialog, setOpenPreviewFileDialog] = useState(false);

  // Fetch all courses from backend for autocomplete
  useEffect(() => {
    const fetchCourses = async () => {
      setCoursesLoading(true);
      try {
        const response = await GetAllCourses();
        console.log("Courses API response:", response.data);
        
        // API returns array directly
        const coursesData = Array.isArray(response.data) ? response.data : [];
        
        // Format courses to ensure consistent field names
        const formattedCourses = coursesData.map(course => ({
          ...course,
          courseId: course.courseID || course.courseId || course.id,
          title: course.title || course.courseName || "Untitled Course"
        }));
        
        console.log("Formatted courses:", formattedCourses);
        setCourses(formattedCourses);
      } catch (error) {
        console.error("Error fetching courses:", error);
        console.error("Error details:", error.response?.data);
        alert("Không thể tải danh sách khóa học. Vui lòng thử lại!");
      } finally {
        setCoursesLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Fetch lessons when component mounts or when selected course changes
  useEffect(() => {
    const fetchLessons = async () => {
      setLoading(true);
      try {
        let response;
        
        if (selectedCourse && selectedCourse.courseId) {
          // Fetch lessons for specific course
          console.log("Fetching lessons for course:", selectedCourse.courseId);
          response = await GetLessonByCourseId(selectedCourse.courseId);
        } else {
          // Fetch all lessons when no course is selected
          console.log("Fetching all lessons");
          response = await GetAllLessons();
        }
        
        console.log("Lessons API response:", response.data);
        
        // API returns array directly
        const lessonsData = Array.isArray(response.data) ? response.data : [];
        
        console.log("Lessons data:", lessonsData);
        
        // Format lessons to match the component's expected structure
        const formatted = lessonsData.map((lesson, index) => ({
          ...lesson,
          id: lesson.lessonID || lesson.lessonId || lesson.id || index + 1,
          lessonId: lesson.lessonID || lesson.lessonId || lesson.id, // Handle both lessonID and lessonId
          title: lesson.title || "Untitled",
          videoUrl: lesson.videoUrl || "",
          courseId: lesson.courseID || lesson.courseId,
          orderIndex: lesson.orderIndex || index + 1,
          materials: (() => {
            // Handle different documentUrl formats
            if (!lesson.documentUrl) return [];
            if (Array.isArray(lesson.documentUrl)) {
              // If it's an array, map each URL
              return lesson.documentUrl.map(url => ({
                name: url.split("/").pop(),
                url: url
              }));
            }
            if (typeof lesson.documentUrl === 'string' && lesson.documentUrl.length > 0) {
              // If it's a string, create single material
              return [{
                name: lesson.documentUrl.split("/").pop(),
                url: lesson.documentUrl
              }];
            }
            return [];
          })()
        }));
        
        console.log("Formatted lessons:", formatted);
        setLessons(formatted);
      } catch (error) {
        console.error("Error fetching lessons:", error);
        console.error("Error details:", error.response?.data);
        alert("Không thể tải danh sách bài giảng. Vui lòng thử lại!");
        setLessons([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, [selectedCourse]);

  // Filter lessons by selected course (no filter needed - handled by API)
  const filteredLessons = lessons;

  // Handler functions
  const handleAddLesson = () => {
    if (!selectedCourse) return;
    
    const courseId = selectedCourse.courseID || selectedCourse.courseId || selectedCourse.id;
    
    console.log("Adding lesson for course:", selectedCourse);
    console.log("Extracted courseId:", courseId);
    
    setIsEditMode(false);
    setSelectedLesson({
      title: "",
      videoUrl: "",
      videoName: "",
      materials: [],
      courseId: courseId,
      courseID: courseId,
      orderIndex: filteredLessons.length + 1,
    });
    setOpenDialog(true);
  };

  const handleEditLesson = async (row) => {
    try {
      // Use lessonID or lessonId from the row
      const lessonId = row.lessonID || row.lessonId || row.id;
      
      console.log("Editing lesson ID:", lessonId);
      
      // Optionally fetch full lesson details from backend
      const response = await GetLessonById(lessonId);
      const lessonData = response.data || row;
      
      console.log("Lesson data for edit:", lessonData);
      
      setIsEditMode(true);
      setSelectedLesson({ 
        ...lessonData,
        id: lessonData.lessonID || lessonData.lessonId || lessonData.id,
        lessonId: lessonData.lessonID || lessonData.lessonId || lessonData.id,
        lessonID: lessonData.lessonID || lessonData.lessonId || lessonData.id,
        courseId: lessonData.courseID || lessonData.courseId,
        materials: (() => {
          if (!lessonData.documentUrl) return [];
          if (Array.isArray(lessonData.documentUrl)) {
            return lessonData.documentUrl
              .filter(url => url && url.length > 0)  // Filter out empty strings
              .map(url => ({
                name: url.split("/").pop(),
                url: url
              }));
          }
          if (typeof lessonData.documentUrl === 'string' && lessonData.documentUrl.length > 0) {
            return [{
              name: lessonData.documentUrl.split("/").pop(),
              url: lessonData.documentUrl
            }];
          }
          return [];
        })(),
      });
      setOpenDialog(true);
    } catch (error) {
      console.error("Error fetching lesson details:", error);
      // Fallback to row data
      setIsEditMode(true);
      setSelectedLesson({ 
        ...row,
        lessonId: row.lessonID || row.lessonId || row.id,
        lessonID: row.lessonID || row.lessonId || row.id,
      });
      setOpenDialog(true);
    }
  };

  const handleDeleteLesson = async (row) => {
    if (!window.confirm("Bạn có chắc muốn xóa bài giảng này?")) return;
    
    try {
      setLoading(true);
      const lessonId = row.lessonID || row.lessonId || row.id;
      
      console.log("Deleting lesson ID:", lessonId);
      
      await DeleteLesson(lessonId);
      
      // Remove from local state
      setLessons((prev) => prev.filter((l) => (l.lessonID || l.lessonId || l.id) !== lessonId));
      alert("Xóa thành công!");
    } catch (error) {
      console.error("Error deleting lesson:", error);
      alert("Không thể xóa bài giảng. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  // Video upload handler
  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Create local preview URL
    const url = URL.createObjectURL(file);
    setSelectedLesson((prev) => ({
      ...prev,
      videoUrl: url,
      videoName: file.name,
      videoFile: file, // Store file for upload
    }));
  };

  // Material upload handler
  const handleMaterialUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const url = URL.createObjectURL(file);
      setSelectedLesson((prev) => ({
        ...prev,
        materials: [
          ...(prev.materials || []),
          { name: file.name, url: url, file: file }, // Store file for upload
        ],
      }));
    });
  };

  const handleRemoveMaterial = (index) => {
    setSelectedLesson((prev) => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index),
    }));
  };

  // Preview handlers
  const handlePreviewVideo = (url) => {
    if (!url) {
      alert("Không có video để xem!");
      return;
    }
    setPreviewVideoUrl(url);
    setOpenPreviewVideoDialog(true);
  };

  const handlePreviewFile = (file) => {
    setPreviewFileUrl(file.url);
    setOpenPreviewFileDialog(true);
  };

  // Helper to get file icon
  const getFileIcon = (filename) => {
    const ext = filename.split(".").pop().toLowerCase();
    if (ext === "pdf") return <PictureAsPdfIcon fontSize="small" color="error" />;
    if (ext === "ppt" || ext === "pptx") return <SlideshowIcon fontSize="small" color="warning" />;
    return <DescriptionIcon fontSize="small" color="info" />;
  };

  // Submit handler - Create or Update lesson
  const handleSubmit = async () => {
    if (!selectedLesson.title) {
      alert("Vui lòng nhập tên bài giảng");
      return;
    }

    if (!selectedLesson.courseId) {
      alert("Vui lòng chọn khóa học");
      return;
    }

    try {
      setLoading(true);

      // Prepare data for API - match backend field names
      const lessonData = {
        title: selectedLesson.title,
        videoUrl: selectedLesson.videoUrl || "",
        documentUrl: selectedLesson.materials?.[0]?.url || "", // Take first material as documentUrl
        courseID: selectedLesson.courseId, // Use courseID (capital D)
        orderIndex: selectedLesson.orderIndex || 1,
      };

      console.log("Submitting lesson data:", lessonData);

      if (isEditMode) {
        // Update existing lesson
        const lessonId = selectedLesson.lessonID || selectedLesson.lessonId || selectedLesson.id;
        
        if (!lessonId) {
          alert("Không tìm thấy ID bài giảng để cập nhật!");
          return;
        }

        console.log("Updating lesson ID:", lessonId);
        const response = await UpdateLesson(lessonId, lessonData);
        
        console.log("Update response:", response.data);
        
        // Refresh the lessons list
        if (selectedCourse && selectedCourse.courseId) {
          const refreshResponse = await GetLessonByCourseId(selectedCourse.courseId);
          const lessonsData = Array.isArray(refreshResponse.data) ? refreshResponse.data : [];
          const formatted = lessonsData.map((lesson, index) => ({
            ...lesson,
            id: lesson.lessonID || lesson.lessonId || lesson.id || index + 1,
            lessonId: lesson.lessonID || lesson.lessonId || lesson.id,
            title: lesson.title || "Untitled",
            videoUrl: lesson.videoUrl || "",
            courseId: lesson.courseID || lesson.courseId,
            orderIndex: lesson.orderIndex || index + 1,
            materials: (() => {
              if (!lesson.documentUrl) return [];
              if (Array.isArray(lesson.documentUrl)) {
                return lesson.documentUrl.map(url => ({
                  name: url.split("/").pop(),
                  url: url
                }));
              }
              if (typeof lesson.documentUrl === 'string' && lesson.documentUrl.length > 0) {
                return [{
                  name: lesson.documentUrl.split("/").pop(),
                  url: lesson.documentUrl
                }];
              }
              return [];
            })()
          }));
          setLessons(formatted);
        } else {
          // Refresh all lessons
          const refreshResponse = await GetAllLessons();
          const lessonsData = Array.isArray(refreshResponse.data) ? refreshResponse.data : [];
          const formatted = lessonsData.map((lesson, index) => ({
            ...lesson,
            id: lesson.lessonID || lesson.lessonId || lesson.id || index + 1,
            lessonId: lesson.lessonID || lesson.lessonId || lesson.id,
            title: lesson.title || "Untitled",
            videoUrl: lesson.videoUrl || "",
            courseId: lesson.courseID || lesson.courseId,
            orderIndex: lesson.orderIndex || index + 1,
            materials: (() => {
              if (!lesson.documentUrl) return [];
              if (Array.isArray(lesson.documentUrl)) {
                return lesson.documentUrl.map(url => ({
                  name: url.split("/").pop(),
                  url: url
                }));
              }
              if (typeof lesson.documentUrl === 'string' && lesson.documentUrl.length > 0) {
                return [{
                  name: lesson.documentUrl.split("/").pop(),
                  url: lesson.documentUrl
                }];
              }
              return [];
            })()
          }));
          setLessons(formatted);
        }
        
        alert("Cập nhật thành công!");
      } else {
        // Create new lesson
        const response = await CreateLesson(lessonData);
        
        console.log("Create response:", response.data);
        
        // Refresh the lessons list
        if (selectedCourse && selectedCourse.courseId) {
          const refreshResponse = await GetLessonByCourseId(selectedCourse.courseId);
          const lessonsData = Array.isArray(refreshResponse.data) ? refreshResponse.data : [];
          const formatted = lessonsData.map((lesson, index) => ({
            ...lesson,
            id: lesson.lessonID || lesson.lessonId || lesson.id || index + 1,
            lessonId: lesson.lessonID || lesson.lessonId || lesson.id,
            title: lesson.title || "Untitled",
            videoUrl: lesson.videoUrl || "",
            courseId: lesson.courseID || lesson.courseId,
            orderIndex: lesson.orderIndex || index + 1,
            materials: lesson.documentUrl ? [{
              name: lesson.documentUrl.split("/").pop(),
              url: lesson.documentUrl
            }] : []
          }));
          setLessons(formatted);
        } else {
          // Refresh all lessons
          const refreshResponse = await GetAllLessons();
          const lessonsData = Array.isArray(refreshResponse.data) ? refreshResponse.data : [];
          const formatted = lessonsData.map((lesson, index) => ({
            ...lesson,
            id: lesson.lessonID || lesson.lessonId || lesson.id || index + 1,
            lessonId: lesson.lessonID || lesson.lessonId || lesson.id,
            title: lesson.title || "Untitled",
            videoUrl: lesson.videoUrl || "",
            courseId: lesson.courseID || lesson.courseId,
            orderIndex: lesson.orderIndex || index + 1,
            materials: lesson.documentUrl ? [{
              name: lesson.documentUrl.split("/").pop(),
              url: lesson.documentUrl
            }] : []
          }));
          setLessons(formatted);
        }
        
        alert("Thêm thành công!");
      }
      
      setOpenDialog(false);
    } catch (error) {
      console.error("Error saving lesson:", error);
      console.error("Error response:", error.response?.data);
      
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.title
        || error.message 
        || "Có lỗi xảy ra";
      
      alert(
        isEditMode
          ? `Không thể cập nhật bài giảng: ${errorMessage}`
          : `Không thể thêm bài giảng: ${errorMessage}`
      );
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { 
      field: "orderIndex", 
      headerName: "STT", 
      width: 80, 
      align: "center", 
      headerAlign: "center",
    },
    { 
      field: "title", 
      headerName: "Tên bài giảng", 
      flex: 1.5, 
      headerAlign: "center",
    },
    {
      field: "materials",
      headerName: "Tài liệu",
      flex: 2,
      headerAlign: "center",
      renderCell: (params) =>
        params.value.length === 0 ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.secondary" }}>
            <AttachFileIcon fontSize="small" sx={{ opacity: 0.5 }} />
            <Typography variant="body2">Chưa có tài liệu</Typography>
          </Box>
        ) : (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ py: 1 }}>
            {params.value.map((m, i) => (
              <Chip
                key={i}
                icon={getFileIcon(m.name)}
                label={m.name}
                size="small"
                onClick={() => handlePreviewFile(m)}
                sx={{ 
                  cursor: "pointer",
                  mb: 0.5,
                  maxWidth: 200,
                  transition: "all 0.2s",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: 2,
                  },
                  "& .MuiChip-label": {
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }
                }}
              />
            ))}
          </Stack>
        ),
    },
    {
      field: "videoUrl",
      headerName: "Video",
      width: 120,
      align: "center",
      headerAlign: "center",
      renderCell: (params) =>
        params.value ? (
          <Tooltip title="Xem video" arrow>
            <IconButton 
              color="secondary" 
              onClick={(e) => {
                e.stopPropagation();
                handlePreviewVideo(params.value);
              }}
              sx={{ 
                transition: "all 0.2s",
                "&:hover": { 
                  backgroundColor: alpha(colors.greenAccent[500], 0.2),
                  transform: "scale(1.1)",
                }
              }}
            >
              <PlayCircleOutlineIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "text.secondary" }}>
            <VideoLibraryIcon fontSize="small" sx={{ opacity: 0.3 }} />
            <Typography variant="caption">Không có</Typography>
          </Box>
        ),
    },
    {
      field: "actions",
      headerName: "Hành động",
      width: 140,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Tooltip title="Chỉnh sửa" arrow>
            <IconButton 
              color="primary" 
              onClick={() => handleEditLesson(params.row)}
              size="small"
              sx={{ 
                transition: "all 0.2s",
                "&:hover": { 
                  transform: "scale(1.1)",
                }
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Xóa" arrow>
            <IconButton 
              color="error" 
              onClick={() => handleDeleteLesson(params.row)}
              size="small"
              sx={{ 
                transition: "all 0.2s",
                "&:hover": { 
                  transform: "scale(1.1)",
                }
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box flex="1" overflow="auto" p={3}>
      <Header title="Quản lý bài giảng" subtitle="Danh sách các bài giảng" />

      {/* Course Selection Card */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mt: 3, 
          mb: 3,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha(colors.primary[400], 0.1)} 0%, ${alpha(colors.greenAccent[400], 0.05)} 100%)`,
          border: `1px solid ${alpha(colors.primary[400], 0.2)}`,
        }}
      >
        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <Autocomplete
            freeSolo={false}
            loading={coursesLoading}
            sx={{ 
              minWidth: 350,
              flex: 1,
              "& .MuiOutlinedInput-root": {
                backgroundColor: theme.palette.mode === "dark" ? alpha("#000", 0.2) : alpha("#fff", 0.9),
                borderRadius: 2,
              }
            }}
            options={courses}
            getOptionLabel={(option) => {
              if (typeof option === 'string') return option;
              return option.title || option.courseName || option.name || '';
            }}
            isOptionEqualToValue={(option, value) => {
              if (!option || !value) return false;
              const optionId = option.courseID || option.courseId || option.id;
              const valueId = value.courseID || value.courseId || value.id;
              return optionId === valueId;
            }}
            value={selectedCourse}
            onInputChange={(e, value) => setKeyword(value)}
            onChange={(e, value) => {
              console.log("=== COURSE SELECTION ===");
              console.log("Selected course raw:", value);
              
              if (value) {
                // Normalize the course object
                const normalizedCourse = {
                  ...value,
                  courseId: value.courseID || value.courseId || value.id,
                  courseID: value.courseID || value.courseId || value.id,
                };
                
                console.log("Normalized course:", normalizedCourse);
                console.log("courseID:", normalizedCourse.courseID, "Type:", typeof normalizedCourse.courseID);
                
                setSelectedCourse(normalizedCourse);
              } else {
                console.log("Course cleared");
                setSelectedCourse(null);
              }
            }}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="Chọn khóa học" 
                placeholder="Tìm kiếm hoặc chọn khóa học..."
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {coursesLoading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={handleAddLesson}
            disabled={!selectedCourse || loading}
            sx={{ 
              borderRadius: 2,
              px: 3,
              py: 1.2,
              textTransform: "none",
              fontWeight: 600,
              boxShadow: selectedCourse ? 4 : 0,
              transition: "all 0.3s",
              "&:hover": {
                transform: selectedCourse ? "translateY(-2px)" : "none",
                boxShadow: selectedCourse ? 6 : 0,
              }
            }}
          >
            Thêm bài giảng mới
          </Button>
        </Box>

        {selectedCourse && (
          <Box mt={2} display="flex" alignItems="center" gap={2}>
            <Chip 
              label={`📚 ${selectedCourse.title || selectedCourse.courseName || 'Khóa học'}`}
              color="primary"
              sx={{ fontWeight: 600, fontSize: "0.9rem", py: 2.5 }}
            />
            <Chip 
              label={`${filteredLessons.length} bài giảng`}
              variant="outlined"
              size="small"
            />
          </Box>
        )}
      </Paper>

      {/* DataGrid */}
      <Paper 
        elevation={0}
        sx={{ 
          height: "calc(100vh - 340px)", 
          borderRadius: 3,
          overflow: "hidden",
          border: `1px solid ${alpha(colors.primary[400], 0.1)}`,
        }}
      >
        <DataGrid
          rows={filteredLessons}
          columns={columns}
          getRowId={(row) => row.id}
          slots={{ toolbar: GridToolbar }}
          pageSizeOptions={[10, 25, 50]}
          getRowHeight={() => 'auto'}
          loading={loading}
          sx={{
            border: "none",
            "& .MuiDataGrid-columnHeaders": { 
              background: alpha(colors.primary[400], 0.1),
              borderRadius: 0,
              fontWeight: 700,
            },
            "& .MuiDataGrid-row": {
              transition: "background-color 0.2s",
              "&:hover": {
                backgroundColor: alpha(colors.primary[400], 0.05),
              }
            },
            '&.MuiDataGrid-root--densityCompact .MuiDataGrid-cell': { py: '8px' },
            '&.MuiDataGrid-root--densityStandard .MuiDataGrid-cell': { py: '12px' },
            '&.MuiDataGrid-root--densityComfortable .MuiDataGrid-cell': { py: '18px' },
          }}
        />
      </Paper>

      {/* Dialog thêm/sửa */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        fullWidth 
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: 24,
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: `1px solid ${alpha(colors.primary[400], 0.1)}`,
          pb: 2,
        }}>
          <Typography variant="h5" fontWeight={700}>
            {isEditMode ? "✏️ Chỉnh sửa bài giảng" : "➕ Thêm bài giảng mới"}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedCourse && (
            <Paper
              elevation={0}
              sx={{ 
                p: 2, 
                mb: 3,
                backgroundColor: alpha(colors.greenAccent[500], 0.1),
                borderRadius: 2,
                border: `1px solid ${alpha(colors.greenAccent[500], 0.3)}`,
              }}
            >
              <Typography variant="body1" fontWeight={600} color="secondary">
                📚 Khóa học: {selectedCourse.title || selectedCourse.courseName || 'N/A'}
              </Typography>
            </Paper>
          )}

          <TextField
            margin="dense"
            label="Tên bài giảng *"
            fullWidth
            value={selectedLesson?.title || ""}
            onChange={(e) => setSelectedLesson({ ...selectedLesson, title: e.target.value })}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label="Thứ tự hiển thị"
            fullWidth
            type="number"
            value={selectedLesson?.orderIndex || ""}
            onChange={(e) =>
              setSelectedLesson({ ...selectedLesson, orderIndex: parseInt(e.target.value) || 1 })
            }
            sx={{ mb: 3 }}
          />

          <Divider sx={{ my: 3 }} />

          {/* Video Section */}
          <Paper
            elevation={0}
            sx={{ 
              p: 2.5, 
              mb: 3,
              backgroundColor: alpha(colors.primary[400], 0.05),
              borderRadius: 2,
              border: `1px dashed ${alpha(colors.primary[400], 0.3)}`,
            }}
          >
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <VideoLibraryIcon color="secondary" />
              <Typography variant="h6" fontWeight={600}>Video bài giảng</Typography>
            </Box>
            
            <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
              <TextField
                label="Nhập URL video (YouTube hoặc link trực tiếp)"
                fullWidth
                size="small"
                value={selectedLesson?.videoUrl || ""}
                onChange={(e) =>
                  setSelectedLesson({ ...selectedLesson, videoUrl: e.target.value })
                }
                sx={{ flex: 1, minWidth: 200 }}
              />
              <Button 
                variant="contained" 
                component="label" 
                startIcon={<CloudUploadIcon />}
                sx={{ 
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Tải lên
                <input type="file" accept="video/*" hidden onChange={handleVideoUpload} />
              </Button>
            </Box>
            
            {selectedLesson?.videoName && (
              <Chip
                icon={<PlayCircleOutlineIcon />}
                label={selectedLesson.videoName}
                color="success"
                sx={{ mt: 2, fontWeight: 500 }}
              />
            )}
          </Paper>

          {/* Materials Section */}
          <Paper
            elevation={0}
            sx={{ 
              p: 2.5,
              backgroundColor: alpha(colors.primary[400], 0.05),
              borderRadius: 2,
              border: `1px dashed ${alpha(colors.primary[400], 0.3)}`,
            }}
          >
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <AttachFileIcon color="info" />
              <Typography variant="h6" fontWeight={600}>Tài liệu đính kèm</Typography>
            </Box>

            <Button 
              variant="outlined" 
              component="label" 
              startIcon={<CloudUploadIcon />}
              sx={{ 
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                borderStyle: "dashed",
                borderWidth: 2,
                py: 1,
              }}
            >
              Tải tài liệu (.pdf, .doc, .ppt, .txt)
              <input
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                multiple
                hidden
                onChange={handleMaterialUpload}
              />
            </Button>

            {selectedLesson?.materials?.length > 0 && (
              <Box mt={2}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
                  {selectedLesson.materials.length} tài liệu đã tải lên
                </Typography>
                {selectedLesson.materials.map((m, idx) => (
                  <Paper
                    key={idx}
                    elevation={0}
                    sx={{ 
                      p: 1.5, 
                      mb: 1, 
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      border: `1px solid ${alpha(colors.primary[300], 0.2)}`,
                      borderRadius: 1.5,
                      transition: "all 0.2s",
                      "&:hover": { 
                        backgroundColor: alpha(colors.primary[400], 0.1),
                        transform: "translateX(4px)",
                      }
                    }}
                  >
                    <Box 
                      display="flex" 
                      alignItems="center" 
                      gap={1.5}
                      sx={{ cursor: "pointer", flex: 1 }}
                      onClick={() => handlePreviewFile(m)}
                    >
                      {getFileIcon(m.name)}
                      <Typography
                        variant="body2"
                        fontWeight={500}
                        sx={{ 
                          "&:hover": { 
                            textDecoration: "underline",
                            color: colors.primary[300],
                          }
                        }}
                      >
                        {m.name}
                      </Typography>
                    </Box>
                    <Tooltip title="Xóa tài liệu" arrow>
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => handleRemoveMaterial(idx)}
                        sx={{
                          transition: "all 0.2s",
                          "&:hover": {
                            transform: "scale(1.1)",
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Paper>
                ))}
              </Box>
            )}
          </Paper>
        </DialogContent>

        <DialogActions sx={{ 
          p: 3, 
          borderTop: `1px solid ${alpha(colors.primary[400], 0.1)}`,
        }}>
          <Button 
            onClick={() => setOpenDialog(false)}
            disabled={loading}
            sx={{ 
              borderRadius: 2,
              textTransform: "none",
              px: 3,
            }}
          >
            Hủy bỏ
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSubmit}
            disabled={loading}
            sx={{ 
              borderRadius: 2,
              textTransform: "none",
              px: 3,
              fontWeight: 600,
            }}
          >
            {loading ? <CircularProgress size={20} /> : (isEditMode ? "💾 Lưu thay đổi" : "➕ Thêm mới")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Preview Video */}
      <Dialog
        open={openPreviewVideoDialog}
        onClose={() => {
          setOpenPreviewVideoDialog(false);
          setPreviewVideoUrl(null);
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: `1px solid ${alpha(colors.primary[400], 0.1)}`,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}>
          <PlayCircleOutlineIcon color="secondary" />
          <Typography variant="h6" fontWeight={600}>Xem trước video</Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {previewVideoUrl ? (
            <Box sx={{ width: "100%", backgroundColor: "#000" }}>
              {previewVideoUrl.includes('youtube.com') || previewVideoUrl.includes('youtu.be') ? (
                <iframe
                  width="100%"
                  height="450"
                  src={previewVideoUrl}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  key={previewVideoUrl}
                  controls
                  autoPlay
                  style={{ width: "100%", maxHeight: "70vh", display: "block" }}
                >
                  <source src={previewVideoUrl} type="video/mp4" />
                  <source src={previewVideoUrl} type="video/webm" />
                  <source src={previewVideoUrl} type="video/ogg" />
                  Trình duyệt của bạn không hỗ trợ video.
                </video>
              )}
            </Box>
          ) : (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography>Không có video để xem</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => {
              setOpenPreviewVideoDialog(false);
              setPreviewVideoUrl(null);
            }}
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Preview File */}
      <Dialog
        open={openPreviewFileDialog}
        onClose={() => setOpenPreviewFileDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: `1px solid ${alpha(colors.primary[400], 0.1)}`,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}>
          <DescriptionIcon color="info" />
          <Typography variant="h6" fontWeight={600}>Xem trước tài liệu</Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {previewFileUrl ? (
            <iframe
              src={previewFileUrl}
              title="Preview Document"
              style={{ width: "100%", height: "80vh", border: "none" }}
            />
          ) : (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography>Không có tài liệu để xem</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setOpenPreviewFileDialog(false)}
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}