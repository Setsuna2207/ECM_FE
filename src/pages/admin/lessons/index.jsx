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
import { mockLessons } from "../../../data/mockLesson";
import { mockCourses } from "../../../data/mockCourse";

export default function ManageLessons() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [lessons, setLessons] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [keyword, setKeyword] = useState("");

  const [openDialog, setOpenDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);

  // Preview states
  const [previewVideoUrl, setPreviewVideoUrl] = useState(null);
  const [openPreviewVideoDialog, setOpenPreviewVideoDialog] = useState(false);
  const [previewFileUrl, setPreviewFileUrl] = useState(null);
  const [openPreviewFileDialog, setOpenPreviewFileDialog] = useState(false);

  // Format lessons at mount
  useEffect(() => {
    const formatted = mockLessons.map((lesson, index) => ({
      ...lesson,
      id: lesson.lessonId || index + 1,
      materials:
        lesson.materials ||
        lesson.documentUrls?.map((url) => ({
          name: url.split("/").pop(),
          url,
        })) ||
        [],
    }));
    setLessons(formatted);
  }, []);

  const filteredLessons =
    selectedCourse && selectedCourse.courseId
      ? lessons.filter((l) => l.courseId === selectedCourse.courseId)
      : lessons;

  const handleAddLesson = () => {
    if (!selectedCourse) return;
    setIsEditMode(false);
    setSelectedLesson({
      title: "",
      description: "",
      videoUrl: "",
      videoName: "",
      materials: [],
      courseId: selectedCourse.courseId,
      orderIndex: filteredLessons.length + 1,
    });
    setOpenDialog(true);
  };

  const handleEditLesson = (row) => {
    setIsEditMode(true);
    setSelectedLesson({ ...row });
    setOpenDialog(true);
  };

  const handleDeleteLesson = (row) => {
    if (window.confirm("Bạn có chắc muốn xóa bài giảng này?")) {
      setLessons((prev) => prev.filter((l) => l.id !== row.id));
      alert("Xóa thành công!");
    }
  };

  // Video upload
  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setSelectedLesson((prev) => ({
      ...prev,
      videoUrl: url,
      videoName: file.name,
    }));
  };

  // Material upload
  const handleMaterialUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const url = URL.createObjectURL(file);
      setSelectedLesson((prev) => ({
        ...prev,
        materials: [
          ...(prev.materials || []),
          { name: file.name, url: url },
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

  const handleSubmit = () => {
    if (!selectedLesson.title) {
      alert("Vui lòng nhập tên bài giảng");
      return;
    }
    if (isEditMode) {
      setLessons((prev) =>
        prev.map((l) => (l.id === selectedLesson.id ? selectedLesson : l))
      );
      alert("Cập nhật thành công!");
    } else {
      setLessons((prev) => [
        { ...selectedLesson, id: prev.length + 1, lessonId: prev.length + 1 },
        ...prev,
      ]);
      alert("Thêm thành công!");
    }
    setOpenDialog(false);
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
            freeSolo
            sx={{ 
              minWidth: 350,
              flex: 1,
              "& .MuiOutlinedInput-root": {
                backgroundColor: theme.palette.mode === "dark" ? alpha("#000", 0.2) : alpha("#fff", 0.9),
                borderRadius: 2,
              }
            }}
            options={mockCourses.map((c) => c.title)}
            value={selectedCourse ? selectedCourse.title : ""}
            onInputChange={(e, value) => setKeyword(value)}
            onChange={(e, value) => {
              const found = mockCourses.find((c) => c.title === value);
              setSelectedCourse(found || null);
            }}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="Chọn khóa học" 
                placeholder="Tìm kiếm hoặc chọn khóa học..."
              />
            )}
          />

          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={handleAddLesson}
            disabled={!selectedCourse}
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
              label={`📚 ${selectedCourse.title}`}
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
                📚 Khóa học: {selectedCourse.title}
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
            label="Mô tả chi tiết"
            fullWidth
            multiline
            rows={3}
            value={selectedLesson?.description || ""}
            onChange={(e) =>
              setSelectedLesson({ ...selectedLesson, description: e.target.value })
            }
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
            sx={{ 
              borderRadius: 2,
              textTransform: "none",
              px: 3,
              fontWeight: 600,
            }}
          >
            {isEditMode ? "💾 Lưu thay đổi" : "➕ Thêm mới"}
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