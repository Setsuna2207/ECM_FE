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
  LinearProgress,
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

import {
  UploadFile,
  UploadMultipleFiles,
  DeleteFile,
  GetFileUploadInfo,
} from "../../../services/fileUploadService";

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
  const [selectedPreviewFile, setSelectedPreviewFile] = useState(null);
  const [openPreviewFileDialog, setOpenPreviewFileDialog] = useState(false);
  const [previewVideoError, setPreviewVideoError] = useState(false);
  const [previewFileError, setPreviewFileError] = useState(false);

  // File upload stat
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingFileName, setUploadingFileName] = useState("");
  const [fileUploadLimits, setFileUploadLimits] = useState(null);

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
              // If it's an array, map each URL and filter out empty strings
              return lesson.documentUrl
                .filter(url => url && url.trim().length > 0)
                .map(url => ({
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

  // Fetch file upload limits on mount
  useEffect(() => {
    const fetchLimits = async () => {
      try {
        const response = await GetFileUploadInfo();
        setFileUploadLimits(response.data.limits);
        console.log("File upload limits:", response.data.limits);
      } catch (error) {
        console.error("Error fetching upload limits:", error);
      }
    };
    fetchLimits();
  }, []);

  // Video upload handler with 5GB limit
  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxVideoSize = 5 * 1024 * 1024 * 1024; // 5 GB

    if (file.size > maxVideoSize) {
      alert(`Video quá lớn! Kích thước tối đa là 5 GB.\nFile của bạn: ${(file.size / (1024 * 1024 * 1024)).toFixed(2)} GB`);
      e.target.value = ""; // Reset input
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setUploadingFileName(file.name);

      const response = await UploadFile(file, "video", (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setUploadProgress(percentCompleted);
      });

      setSelectedLesson((prev) => ({
        ...prev,
        videoUrl: response.data.url,
        videoName: response.data.fileName,
      }));

      alert("✅ Tải video thành công!");
    } catch (error) {
      console.error("Error uploading video:", error);
      const errorMsg = error.response?.data?.message || error.message || "Lỗi không xác định";
      alert(`❌ Không thể tải video:\n${errorMsg}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setUploadingFileName("");
      e.target.value = ""; // Reset input
    }
  };

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

  // Material upload handler with 100MB per file limit
  const handleMaterialUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const maxDocSize = 100 * 1024 * 1024; // 100 MB

    // Check each file size
    const oversizedFiles = files.filter(f => f.size > maxDocSize);
    if (oversizedFiles.length > 0) {
      const fileList = oversizedFiles.map(f =>
        `${f.name} (${(f.size / (1024 * 1024)).toFixed(2)} MB)`
      ).join("\n");
      alert(`❌ Các file sau quá lớn (tối đa 100 MB):\n${fileList}`);
      e.target.value = ""; // Reset input
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setUploadingFileName(`${files.length} tài liệu`);

      const response = await UploadMultipleFiles(files, "document", (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setUploadProgress(percentCompleted);
      });

      // Add uploaded files to materials
      const uploadedFiles = response.data.files.map(file => ({
        name: file.fileName,
        url: file.url,
      }));

      setSelectedLesson((prev) => ({
        ...prev,
        materials: [...(prev.materials || []), ...uploadedFiles],
      }));

      if (response.data.errors && response.data.errors.length > 0) {
        alert(`⚠️ Một số file không tải được:\n${response.data.errors.join("\n")}\n\n✅ Đã tải thành công: ${response.data.successCount} file`);
      } else {
        alert(`✅ Tải thành công ${response.data.successCount} tài liệu!`);
      }
    } catch (error) {
      console.error("Error uploading documents:", error);
      const errorMsg = error.response?.data?.message || error.message || "Lỗi không xác định";
      alert(`❌ Không thể tải tài liệu:\n${errorMsg}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setUploadingFileName("");
      e.target.value = ""; // Reset input
    }
  };

  // Remove material with optional server deletion
  const handleRemoveMaterial = async (index) => {
    const material = selectedLesson.materials[index];

    // If it's already uploaded to server, ask to delete
    if (material.url.startsWith("/uploads/")) {
      const confirmDelete = window.confirm(
        `Xóa file "${material.name}"?\n\nChọn OK để xóa vĩnh viễn khỏi server\nChọn Cancel để chỉ xóa khỏi danh sách`
      );

      if (confirmDelete) {
        try {
          await DeleteFile(material.url);
          console.log("File deleted from server:", material.url);
        } catch (error) {
          console.error("Error deleting file from server:", error);
          alert("⚠️ Không thể xóa file khỏi server, nhưng sẽ xóa khỏi danh sách");
        }
      }
    }

    // Remove from local state
    setSelectedLesson((prev) => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index),
    }));
  };

  // Helper to check if URL is a Google Drive preview URL
  const isGoogleDriveUrl = (url) => {
    if (!url) return false;
    return url.includes("drive.google.com") || url.includes("docs.google.com");
  };

  // Preview handlers
  const handlePreviewVideo = (url) => {
    if (!url) {
      alert("Không có video để xem!");
      return;
    }
    const fullUrl = getFullUrl(url);
    console.log("Preview video URL:", url, "->", fullUrl);
    setPreviewVideoError(false);
    setPreviewVideoUrl(fullUrl);
    setOpenPreviewVideoDialog(true);
  };

  const handlePreviewFile = (file) => {
    const fullUrl = getFullUrl(file.url);
    console.log("Preview file URL:", file.url, "->", fullUrl);

    // Extract file extension
    const fileName = file.name || file.url.split("/").pop();
    const ext = fileName.split(".").pop().toLowerCase();

    // Store file info for preview
    setSelectedPreviewFile({ url: fullUrl, fileName, ext });
    setPreviewFileUrl(fullUrl);
    setPreviewFileError(false);
    setOpenPreviewFileDialog(true);
  };

  // Helper to get file icon
  const getFileIcon = (filename) => {
    const ext = filename.split(".").pop().toLowerCase();
    if (ext === "pdf") return <PictureAsPdfIcon fontSize="small" color="error" />;
    if (ext === "ppt" || ext === "pptx") return <SlideshowIcon fontSize="small" color="warning" />;
    return <DescriptionIcon fontSize="small" color="info" />;
  };

  // Helper to convert relative URLs to full URLs
  const getFullUrl = (url) => {
    if (!url) return "";
    // If it's already a full URL (http/https), return as is
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    // If it's a frontend asset path (contains /src/), return as is (Vite will handle it)
    if (url.includes("/src/")) {
      return url;
    }
    // If it's a relative URL starting with /, prepend the API base URL
    if (url.startsWith("/")) {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "https://localhost:7264/api";
      // Remove /api or /api/v1 from base URL to get the server root
      const serverRoot = baseUrl.replace(/\/api.*$/, "");
      return `${serverRoot}${url}`;
    }
    // Otherwise return as is
    return url;
  };

  // Helper function to refresh lessons list
  const refreshLessons = async () => {
    try {
      let response;

      if (selectedCourse && selectedCourse.courseId) {
        response = await GetLessonByCourseId(selectedCourse.courseId);
      } else {
        response = await GetAllLessons();
      }

      const lessonsData = Array.isArray(response.data) ? response.data : [];

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
            return lesson.documentUrl
              .filter(url => url && url.trim().length > 0)
              .map(url => ({
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
    } catch (error) {
      console.error("Error refreshing lessons:", error);
    }
  };

  // Submit handler - Create or Update lesson
  const handleSubmit = async () => {
    if (!selectedLesson.title) {
      alert("Vui lòng nhập tên bài giảng");
      return;
    }

    if (!selectedLesson.courseId && !selectedLesson.courseID) {
      alert("Vui lòng chọn khóa học");
      return;
    }

    try {
      setLoading(true);

      // Extract valid URLs from materials (filter out empty strings)
      const documentUrls = (selectedLesson.materials || [])
        .map(m => m.url)
        .filter(url => url && url.trim().length > 0);

      // Prepare data for API - ensure field names match backend exactly
      const lessonData = {
        title: selectedLesson.title || "",
        videoUrl: selectedLesson.videoUrl || "",
        documentUrl: documentUrls, // Array of strings
        courseID: selectedLesson.courseID || selectedLesson.courseId, // Use courseID (capital D)
        orderIndex: selectedLesson.orderIndex || 1,
      };

      console.log("=== SUBMITTING LESSON ===");
      console.log("Lesson data:", JSON.stringify(lessonData, null, 2));
      console.log("Is Edit Mode:", isEditMode);

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
        alert("✅ Cập nhật thành công!");
      } else {
        // Create new lesson
        console.log("Creating new lesson");
        const response = await CreateLesson(lessonData);

        console.log("Create response:", response.data);
        alert("✅ Thêm thành công!");
      }

      // Refresh the lessons list
      await refreshLessons();

      setOpenDialog(false);
    } catch (error) {
      console.error("=== ERROR SAVING LESSON ===");
      console.error("Error object:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);

      // Extract error message
      let errorMessage = "Có lỗi xảy ra";

      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.errors) {
          // Handle validation errors array
          if (Array.isArray(error.response.data.errors)) {
            errorMessage = error.response.data.errors.join("\n");
          } else {
            errorMessage = JSON.stringify(error.response.data.errors);
          }
        } else if (error.response.data.title) {
          errorMessage = error.response.data.title;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      alert(
        isEditMode
          ? `❌ Không thể cập nhật bài giảng:\n${errorMessage}`
          : `❌ Không thể thêm bài giảng:\n${errorMessage}`
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
                disabled={isUploading}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Tải lên video (Max: 5 GB)
                <input
                  type="file"
                  accept="video/*,.mp4,.avi,.mov,.wmv,.flv,.webm,.mkv,.m4v"
                  hidden
                  onChange={handleVideoUpload}
                  disabled={isUploading}
                />
              </Button>
            </Box>

            {isUploading && (
              <Box sx={{ mt: 2, mb: 2 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="text.secondary">
                    📤 Đang tải: {uploadingFileName}
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color="primary">
                    {uploadProgress}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={uploadProgress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: alpha(colors.primary[400], 0.1),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                    }
                  }}
                />
                {uploadProgress < 100 && (
                  <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                    💡 Tip: Đừng đóng cửa sổ trong khi đang tải lên
                  </Typography>
                )}
              </Box>
            )}

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

            <Box display="flex" alignItems="center" gap={2} flexWrap="wrap" mb={2}>
              <TextField
                label="Nhập URL tài liệu (Google Drive, etc.)"
                fullWidth
                size="small"
                placeholder="https://drive.google.com/... hoặc URL khác"
                sx={{ flex: 1, minWidth: 250 }}
                onChange={(e) => {
                  const url = e.target.value.trim();
                  if (url) {
                    // Temporarily store in a ref or state to add on button click
                    window.materialUrlInput = url;
                  }
                }}
              />
              <Button
                variant="contained"
                color="secondary"
                startIcon={<AddIcon />}
                onClick={() => {
                  const url = window.materialUrlInput?.trim();
                  if (!url) {
                    alert("Vui lòng nhập URL tài liệu");
                    return;
                  }

                  // Extract filename from URL or use generic name
                  const fileName = url.split("/").pop() || `Tài liệu - ${new Date().getTime()}`;

                  setSelectedLesson((prev) => ({
                    ...prev,
                    materials: [
                      ...(prev.materials || []),
                      { name: fileName, url: url }
                    ]
                  }));

                  // Clear input
                  window.materialUrlInput = "";
                  const input = document.querySelector('input[placeholder*="Google Drive"]');
                  if (input) input.value = "";

                  alert("✅ Thêm tài liệu thành công!");
                }}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Thêm URL
              </Button>
            </Box>

            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              disabled={isUploading}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                borderStyle: "dashed",
                borderWidth: 2,
                py: 1,
              }}
            >
              Tải tài liệu (Max: 100 MB/file)
              <input
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.xls,.xlsx"
                multiple
                hidden
                onChange={handleMaterialUpload}
                disabled={isUploading}
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
          setPreviewVideoError(false);
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
          {previewVideoError ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <VideoLibraryIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
              <Typography color="text.secondary">Tài liệu không hỗ trợ preview</Typography>
            </Box>
          ) : previewVideoUrl ? (
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
                  onError={() => setPreviewVideoError(true)}
                />
              ) : (
                <video
                  key={previewVideoUrl}
                  controls
                  autoPlay
                  style={{ width: "100%", maxHeight: "70vh", display: "block" }}
                  onError={() => setPreviewVideoError(true)}
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
              setPreviewVideoError(false);
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
        onClose={() => {
          setOpenPreviewFileDialog(false);
          setPreviewFileError(false);
          setSelectedPreviewFile(null);
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
          <DescriptionIcon color="info" />
          <Typography variant="h6" fontWeight={600}>
            Xem trước: {selectedPreviewFile?.fileName || 'Tài liệu'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 0, minHeight: "60vh" }}>
          {selectedPreviewFile ? (
            <>
              {/* PDF Preview */}
              {selectedPreviewFile.ext === "pdf" && (
                selectedPreviewFile.url.includes("drive.google.com") ? (
                  <iframe
                    src={selectedPreviewFile.url}
                    title={selectedPreviewFile.fileName}
                    style={{ width: "100%", height: "70vh", border: "none" }}
                    onError={() => setPreviewFileError(true)}
                  />
                ) : (
                  <Box
                    sx={{
                      width: "100%",
                      height: "70vh",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#f5f5f5",
                      gap: 3,
                      p: 4,
                    }}
                  >
                    <PictureAsPdfIcon sx={{ fontSize: 80, color: "#E53935" }} />
                    <Typography variant="h5" fontWeight={700} color="text.primary">
                      {selectedPreviewFile.fileName}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" textAlign="center">
                      Tài liệu PDF sẵn sàng để xem. Nhấn nút bên dưới để mở trong tab mới hoặc tải xuống.
                    </Typography>
                    <Box display="flex" gap={2}>
                      <Button
                        variant="outlined"
                        size="large"
                        startIcon={<PlayCircleOutlineIcon />}
                        href={selectedPreviewFile.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: 600,
                          borderColor: "#E53935",
                          color: "#E53935",
                          "&:hover": {
                            borderColor: "#C62828",
                            backgroundColor: alpha("#E53935", 0.1)
                          },
                        }}
                      >
                        Mở trong tab mới
                      </Button>
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={<CloudUploadIcon />}
                        href={selectedPreviewFile.url}
                        download
                        sx={{
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: 600,
                          backgroundColor: "#E53935",
                          "&:hover": { backgroundColor: "#C62828" },
                        }}
                      >
                        Tải xuống
                      </Button>
                    </Box>
                  </Box>
                )
              )}

              {/* Word Document Preview */}
              {(selectedPreviewFile.ext === "docx" || selectedPreviewFile.ext === "doc") && (
                selectedPreviewFile.url.includes("drive.google.com") ? (
                  <iframe
                    src={selectedPreviewFile.url}
                    title={selectedPreviewFile.fileName}
                    style={{ width: "100%", height: "70vh", border: "none" }}
                    onError={() => setPreviewFileError(true)}
                  />
                ) : (
                  <Box
                    sx={{
                      width: "100%",
                      height: "70vh",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#f5f5f5",
                      gap: 3,
                      p: 4,
                    }}
                  >
                    <DescriptionIcon sx={{ fontSize: 80, color: "#1E88E5" }} />
                    <Typography variant="h5" fontWeight={700} color="text.primary">
                      {selectedPreviewFile.fileName}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" textAlign="center">
                      Tài liệu Word không thể xem trước trực tiếp trong trình duyệt.
                      Vui lòng tải xuống để xem toàn bộ nội dung.
                    </Typography>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<CloudUploadIcon />}
                      href={selectedPreviewFile.url}
                      download
                      sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 600,
                        backgroundColor: "#1E88E5",
                        "&:hover": { backgroundColor: "#1565C0" },
                      }}
                    >
                      Tải xuống tài liệu
                    </Button>
                  </Box>
                )
              )}

              {/* PowerPoint Preview */}
              {(selectedPreviewFile.ext === "pptx" || selectedPreviewFile.ext === "ppt") && (
                selectedPreviewFile.url.includes("drive.google.com") ? (
                  <iframe
                    src={selectedPreviewFile.url}
                    title={selectedPreviewFile.fileName}
                    style={{ width: "100%", height: "70vh", border: "none" }}
                    onError={() => setPreviewFileError(true)}
                  />
                ) : (
                  <Box
                    sx={{
                      width: "100%",
                      height: "70vh",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#f5f5f5",
                      gap: 3,
                      p: 4,
                    }}
                  >
                    <SlideshowIcon sx={{ fontSize: 80, color: "#FB8C00" }} />
                    <Typography variant="h5" fontWeight={700} color="text.primary">
                      {selectedPreviewFile.fileName}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" textAlign="center">
                      Tài liệu PowerPoint không thể xem trước trực tiếp trong trình duyệt.
                      Vui lòng tải xuống để xem toàn bộ nội dung.
                    </Typography>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<CloudUploadIcon />}
                      href={selectedPreviewFile.url}
                      download
                      sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 600,
                        backgroundColor: "#FB8C00",
                        "&:hover": { backgroundColor: "#F57C00" },
                      }}
                    >
                      Tải xuống tài liệu
                    </Button>
                  </Box>
                )
              )}

              {/* Other file types */}
              {!["pdf", "docx", "doc", "pptx", "ppt"].includes(selectedPreviewFile.ext) && (
                <Box
                  sx={{
                    width: "100%",
                    height: "70vh",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#f5f5f5",
                    gap: 3,
                    p: 4,
                  }}
                >
                  <DescriptionIcon sx={{ fontSize: 80, color: "#6D4C41" }} />
                  <Typography variant="h5" fontWeight={700} color="text.primary">
                    {selectedPreviewFile.fileName}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" textAlign="center">
                    Định dạng {selectedPreviewFile.ext.toUpperCase()} không hỗ trợ xem trước.
                    Vui lòng tải xuống để xem tài liệu.
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<CloudUploadIcon />}
                    href={selectedPreviewFile.url}
                    download
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                      backgroundColor: "#6D4C41",
                      "&:hover": { backgroundColor: "#5D4037" },
                    }}
                  >
                    Tải xuống tài liệu
                  </Button>
                </Box>
              )}
            </>
          ) : (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography>Không có tài liệu để xem</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => {
              setOpenPreviewFileDialog(false);
              setPreviewFileError(false);
              setSelectedPreviewFile(null);
            }}
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}