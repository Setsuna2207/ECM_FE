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
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import SlideshowIcon from "@mui/icons-material/Slideshow";
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
    console.log("Video URL:", url); // Debug log
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
    if (ext === "pdf") return <PictureAsPdfIcon fontSize="small" />;
    if (ext === "ppt" || ext === "pptx") return <SlideshowIcon fontSize="small" />;
    return <DescriptionIcon fontSize="small" />;
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
    { field: "orderIndex", headerName: "ID", width: 70, align: "center", headerAlign: "center" },
    { field: "title", headerName: "Tên bài giảng", flex: 1.5, headerAlign: "center" },
    {
      field: "materials",
      headerName: "Tài liệu",
      flex: 2,
      headerAlign: "center",
      renderCell: (params) =>
        params.value.length === 0 ? (
          <Typography color="text.secondary">Không có</Typography>
        ) : (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ py: 0.5 }}>
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
      width: 100,
      align: "center",
      headerAlign: "center",
      renderCell: (params) =>
        params.value ? (
          <IconButton 
            color="secondary" 
            onClick={(e) => {
              e.stopPropagation();
              handlePreviewVideo(params.value);
            }}
            sx={{ "&:hover": { backgroundColor: colors.primary[300] + "20" } }}
          >
            <VideoLibraryIcon />
          </IconButton>
        ) : (
          <Typography color="text.secondary" variant="body2">Không có</Typography>
        ),
    },
    {
      field: "actions",
      headerName: "Hành động",
      width: 120,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Box>
          <IconButton color="primary" onClick={() => handleEditLesson(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton color="error" onClick={() => handleDeleteLesson(params.row)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box flex="1" overflow="auto" p={3}>
      <Header title="Quản lý bài giảng" subtitle="Danh sách các bài giảng" />

      {/* Chọn khóa học */}
      <Box display="flex" alignItems="center" gap={2} mt={3} mb={2}>
        <Autocomplete
          freeSolo
          sx={{ minWidth: 300 }}
          options={mockCourses.map((c) => c.title)}
          value={selectedCourse ? selectedCourse.title : ""}
          onInputChange={(e, value) => setKeyword(value)}
          onChange={(e, value) => {
            const found = mockCourses.find((c) => c.title === value);
            setSelectedCourse(found || null);
          }}
          renderInput={(params) => (
            <TextField {...params} label="Nhập hoặc chọn khóa học" />
          )}
        />

        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          onClick={handleAddLesson}
          disabled={!selectedCourse}
          sx={{ borderRadius: 2 }}
        >
          Thêm bài giảng
        </Button>
      </Box>

      {/* DataGrid */}
      <Box height="70vh" sx={{ "& .MuiDataGrid-columnHeaders": { background: colors.gray[900] } }}>
        <DataGrid
          rows={filteredLessons}
          columns={columns}
          getRowId={(row) => row.id}
          slots={{ toolbar: GridToolbar }}
          pageSizeOptions={[10, 25, 50]}
          getRowHeight={() => 'auto'}
          sx={{
            '&.MuiDataGrid-root--densityCompact .MuiDataGrid-cell': { py: '8px' },
            '&.MuiDataGrid-root--densityStandard .MuiDataGrid-cell': { py: '15px' },
            '&.MuiDataGrid-root--densityComfortable .MuiDataGrid-cell': { py: '22px' },
          }}
        />
      </Box>

      {/* Dialog thêm/sửa */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>{isEditMode ? "Chỉnh sửa bài giảng" : "Thêm bài giảng"}</DialogTitle>
        <DialogContent>
          {selectedCourse && (
            <Typography fontWeight="bold" color="secondary" mb={2} mt={1}>
              Khóa học: {selectedCourse.title}
            </Typography>
          )}

          <TextField
            margin="dense"
            label="Tên bài giảng"
            fullWidth
            value={selectedLesson?.title || ""}
            onChange={(e) => setSelectedLesson({ ...selectedLesson, title: e.target.value })}
          />

          <TextField
            margin="dense"
            label="Mô tả"
            fullWidth
            multiline
            rows={3}
            value={selectedLesson?.description || ""}
            onChange={(e) =>
              setSelectedLesson({ ...selectedLesson, description: e.target.value })
            }
          />

          <TextField
            margin="dense"
            label="Thứ tự"
            fullWidth
            type="number"
            value={selectedLesson?.orderIndex || ""}
            onChange={(e) =>
              setSelectedLesson({ ...selectedLesson, orderIndex: parseInt(e.target.value) || 1 })
            }
          />

          {/* Video */}
          <Box mt={3}>
            <Typography fontWeight={600} mb={1}>Video bài giảng</Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <TextField
                label="Video URL"
                fullWidth
                size="small"
                value={selectedLesson?.videoUrl || ""}
                onChange={(e) =>
                  setSelectedLesson({ ...selectedLesson, videoUrl: e.target.value })
                }
              />
              <Button variant="outlined" component="label" sx={{ borderRadius: 2 }}>
                Upload
                <input type="file" accept="video/*" hidden onChange={handleVideoUpload} />
              </Button>
            </Box>
            {selectedLesson?.videoName && (
              <Typography variant="body2" color="text.secondary" mt={1}>
                📹 {selectedLesson.videoName}
              </Typography>
            )}
          </Box>

          {/* Materials */}
          <Box mt={3}>
            <Typography fontWeight={600} mb={1}>Tài liệu (.pdf, .doc, .ppt, .txt)</Typography>

            <Button 
              variant="outlined" 
              component="label" 
              sx={{ borderRadius: 2 }}
              startIcon={<AddIcon />}
            >
              Tải tài liệu
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
                {selectedLesson.materials.map((m, idx) => (
                  <Box
                    key={idx}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ 
                      p: 1, 
                      mb: 1, 
                      border: "1px solid",
                      borderColor: colors.primary[300],
                      borderRadius: 1,
                      "&:hover": { backgroundColor: colors.primary[900] + "20" }
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      {getFileIcon(m.name)}
                      <Typography
                        sx={{ 
                          cursor: "pointer", 
                          "&:hover": { textDecoration: "underline" }
                        }}
                        onClick={() => handlePreviewFile(m)}
                      >
                        {m.name}
                      </Typography>
                    </Box>
                    <IconButton 
                      size="small" 
                      color="error" 
                      onClick={() => handleRemoveMaterial(idx)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            {isEditMode ? "Lưu" : "Thêm mới"}
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
      >
        <DialogTitle>Xem trước video</DialogTitle>
        <DialogContent>
          {previewVideoUrl ? (
            <Box sx={{ width: "100%", mt: 2 }}>
              {previewVideoUrl.includes('youtube.com') || previewVideoUrl.includes('youtu.be') ? (
                // YouTube iframe
                <iframe
                  width="100%"
                  height="400"
                  src={previewVideoUrl}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ borderRadius: 8 }}
                />
              ) : (
                // Regular video file
                <video
                  key={previewVideoUrl}
                  controls
                  autoPlay
                  style={{ width: "100%", borderRadius: 8, maxHeight: "70vh" }}
                >
                  <source src={previewVideoUrl} type="video/mp4" />
                  <source src={previewVideoUrl} type="video/webm" />
                  <source src={previewVideoUrl} type="video/ogg" />
                  Trình duyệt của bạn không hỗ trợ video.
                </video>
              )}
            </Box>
          ) : (
            <Typography>Không có video để xem</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenPreviewVideoDialog(false);
            setPreviewVideoUrl(null);
          }}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Preview File PDF */}
      <Dialog
        open={openPreviewFileDialog}
        onClose={() => setOpenPreviewFileDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Xem trước tài liệu</DialogTitle>
        <DialogContent>
          {previewFileUrl ? (
            <iframe
              src={previewFileUrl}
              title="Preview PDF"
              style={{ width: "100%", height: "80vh", border: "none" }}
            />
          ) : (
            <Typography>Không có tài liệu để xem</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPreviewFileDialog(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}