import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Typography,
  useTheme,
  Card,
  CardContent,
  RadioGroup,
  Radio,
  FormControlLabel,
  Autocomplete,
  Paper,
  Divider,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";

import { tokens } from "../../../theme";
import Header from "../../../components/Header";
import { mockQuizzes } from "../../../data/mockQuiz";
import { mockLessons } from "../../../data/mockLesson";
import { mockCourses } from "../../../data/mockCourse";
import { getQuizById } from "../../../data/quiz/quizRegistry";

/* QUESTION PREVIEW CARD */
const QuestionPreviewCard = ({
  question,
  index,
  isEditingDetails,
  onUpdateQuestion,
  onUpdateOption,
}) => {
  return (
    <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
      <CardContent sx={{ p: 3 }}>
        {/* EDIT MODE */}
        {isEditingDetails ? (
          <>
            <TextField
              fullWidth
              label={`Câu ${index + 1}`}
              value={question.question}
              onChange={(e) => onUpdateQuestion(index, "question", e.target.value)}
              sx={{ mb: 2 }}
              multiline
            />

            {question.options?.map((opt, i) => (
              <Box key={i} display="flex" alignItems="center" gap={1} mb={1}>
                <Radio
                  checked={question.correctAnswer === i}
                  onChange={() => onUpdateQuestion(index, "correctAnswer", i)}
                />
                <TextField
                  fullWidth
                  size="small"
                  label={`Đáp án ${i + 1}`}
                  value={opt}
                  onChange={(e) => onUpdateOption(index, i, e.target.value)}
                />
              </Box>
            ))}
          </>
        ) : (
          <>
            {/* HEADER */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="600" color="primary">
                Câu {index + 1}
              </Typography>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* QUESTION TEXT */}
            <Typography variant="body1" fontWeight="500" mb={2}>
              {question.question}
            </Typography>

            {/* OPTIONS */}
            <RadioGroup>
              {question.options.map((opt, i) => (
                <Paper
                  key={i}
                  elevation={0}
                  sx={{
                    mb: 1.5,
                    p: 1.5,
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    backgroundColor: question.correctAnswer === i ? "#e8f5e9" : "transparent",
                  }}
                >
                  <FormControlLabel
                    value={i}
                    control={<Radio disabled />}
                    label={
                      <Typography
                        sx={{
                          color: question.correctAnswer === i ? "#2e7d32" : "inherit",
                          fontWeight: question.correctAnswer === i ? 600 : 400,
                        }}
                      >
                        {opt} {question.correctAnswer === i && "✓"}
                      </Typography>
                    }
                    sx={{ width: "100%", m: 0 }}
                  />
                </Paper>
              ))}
            </RadioGroup>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default function ManageQuiz() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [quizzes, setQuizzes] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  // Filters
  const [lessonTitle, setLessonTitle] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [filterCourse, setFilterCourse] = useState(null);
  const [filterLesson, setFilterLesson] = useState(null);

  // Preview
  const [openPreview, setOpenPreview] = useState(false);
  const [previewQuestions, setPreviewQuestions] = useState([]);
  const [previewMedia, setPreviewMedia] = useState(null);
  const [isEditingDetails, setIsEditingDetails] = useState(false);

  /*  LOAD QUIZ LIST  */
  useEffect(() => {
    const formatted = mockQuizzes.map((q, idx) => {
      const lesson = mockLessons.find((l) => l.lessonId === q.lessonId);
      const course = lesson ? mockCourses.find((c) => c.courseId === lesson.courseId) : null;
      return {
        ...q,
        id: q.quizId || idx + 1,
        lessonTitle: lesson ? lesson.title : "Không tìm thấy bài giảng",
        courseTitle: course ? course.title : "Không tìm thấy khóa học",
      };
    });

    setQuizzes(formatted);
  }, []);

  const filteredQuizzes = quizzes.filter((q) => {
    const matchCourse = filterCourse ? q.courseTitle === filterCourse.title : true;
    const matchLesson = filterLesson ? q.lessonTitle === filterLesson.title : true;
    return matchCourse && matchLesson;
  });

  const handleUploadQuizFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const fileUrl = URL.createObjectURL(file);
      const json = JSON.parse(text);

      setSelectedQuiz((prev) => ({
        ...prev,
        uploadedFileName: file.name,
        questionFileUrl: fileUrl,
        uploadedQuizData: json,
      }));
    } catch (error) {
      alert("Lỗi đọc file JSON.");
    }
  };

  const handleUploadMediaFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setSelectedQuiz((prev) => ({
      ...prev,
      mediaUrl: url,
      uploadedMediaName: file.name,
    }));
  };

  const handleAdd = () => {
    setSelectedQuiz({
      lessonId: "",
      questionFileUrl: "",
      mediaUrl: "",
      description: "",
    });

    setCourseTitle("");
    setLessonTitle("");
    setIsEditMode(false);
    setOpenDialog(true);
  };

  const handleEdit = (row) => {
    setSelectedQuiz({ ...row });

    const lesson = mockLessons.find((l) => l.lessonId === row.lessonId);
    setLessonTitle(lesson?.title || "");

    const course = mockCourses.find((c) => c.courseId === lesson?.courseId);
    setCourseTitle(course?.title || "");

    setIsEditMode(true);
    setOpenDialog(true);
  };

  const handleDelete = (row) => {
    if (window.confirm("Xóa quiz này?")) {
      setQuizzes((prev) => prev.filter((q) => q.id !== row.id));
    }
  };

  const handleSave = () => {
    if (!selectedQuiz.lessonId || !selectedQuiz.questionFileUrl) {
      return alert("Vui lòng chọn bài giảng + upload file quiz.");
    }

    const updated = isEditMode
      ? quizzes.map((q) => (q.id === selectedQuiz.id ? selectedQuiz : q))
      : [
          {
            ...selectedQuiz,
            id: quizzes.length + 1,
            quizId: quizzes.length + 1,
          },
          ...quizzes,
        ];

    setQuizzes(updated);
    setOpenDialog(false);
  };

  /* PREVIEW LOADER */
  const handlePreview = async (q) => {
    setOpenPreview(true);
    setIsEditingDetails(false);
    setPreviewMedia(q.mediaUrl || null);

    let questions = null;

    if (q.uploadedQuizData) {
      questions = q.uploadedQuizData.questions;
    } else {
      const stored = getQuizById(q.quizId);
      if (stored) questions = stored.questions;
    }

    setPreviewQuestions(questions || []);
  };

  const handleClosePreview = () => {
    setIsEditingDetails(false);
    setOpenPreview(false);
  };

  const handleUpdateQuestion = (index, field, value) => {
    setPreviewQuestions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleUpdateOption = (qIndex, optIndex, value) => {
    setPreviewQuestions((prev) => {
      const updated = [...prev];
      updated[qIndex].options[optIndex] = value;
      return updated;
    });
  };

  const handleSaveQuizDetails = () => {
    console.log("New Quiz Details:", previewQuestions);
    alert("Đã lưu thay đổi nội dung quiz!");
    setIsEditingDetails(false);
    setOpenPreview(false);
  };

  const columns = [
    { field: "id", headerName: "QuizID", width: 90 },
    {
      field: "lessonTitle",
      headerName: "Bài giảng",
      flex: 1,
    },
    {
      field: "courseTitle",
      headerName: "Khóa học",
      flex: 1,
    },
    {
      field: "questionFileUrl",
      headerName: "File",
      width: 150,
      renderCell: (params) => (
        <Button
          color="secondary"
          size="small"
          startIcon={<VisibilityIcon />}
          onClick={() => handlePreview(params.row)}
        >
          Xem quiz
        </Button>
      ),
    },
    {
      field: "mediaUrl",
      headerName: "Media",
      width: 120,
      renderCell: (params) =>
        params.value ? (
          <VideoLibraryIcon color="success" />
        ) : (
          <Typography color="text.secondary">Không có</Typography>
        ),
    },
    {
      field: "actions",
      headerName: "Hành động",
      width: 160,
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

  return (
    <Box flex={1} p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Header title="Quản lý Quiz" subtitle="Danh sách bài quiz" />

        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          sx={{ borderRadius: 2 }}
          onClick={handleAdd}
        >
          Thêm Quiz
        </Button>
      </Box>

      {/* FILTERS */}
      <Box display="flex" gap={2} mb={2}>
        <Autocomplete
          sx={{ width: "40%" }}
          options={mockCourses}
          getOptionLabel={(opt) => opt.title || ""}
          value={filterCourse}
          onChange={(e, val) => {
            setFilterCourse(val || null);
            setFilterLesson(null);
          }}
          renderInput={(params) => <TextField {...params} label="Lọc theo khóa học" />}
        />

        <Autocomplete
          sx={{ width: "60%" }}
          options={filterCourse ? mockLessons.filter((l) => l.courseId === filterCourse.courseId) : []}
          getOptionLabel={(opt) => opt.title || ""}
          value={filterLesson}
          onChange={(e, val) => setFilterLesson(val || null)}
          renderInput={(params) => <TextField {...params} label="Lọc theo bài giảng" />}
          disabled={!filterCourse}
        />
      </Box>

      {/* GRID */}
      <Box height="70vh">
        <DataGrid
          rows={filteredQuizzes}
          columns={columns}
          getRowId={(row) => row.id}
          slots={{ toolbar: GridToolbar }}
        />
      </Box>

      {/* DIALOG ADD/EDIT */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditMode ? "Chỉnh sửa Quiz" : "Thêm Quiz mới"}</DialogTitle>
        <DialogContent>
          <Box mt={1}>
            <Autocomplete
              options={mockCourses}
              getOptionLabel={(opt) => opt.title}
              value={mockCourses.find((c) => c.title === courseTitle) || null}
              onChange={(e, val) => {
                setCourseTitle(val?.title || "");
                setLessonTitle("");
                setSelectedQuiz((prev) => ({ ...prev, lessonId: "" }));
              }}
              renderInput={(params) => <TextField {...params} label="Khóa học" />}
            />
          </Box>

          <Box mt={2}>
            <Autocomplete
              options={
                courseTitle
                  ? mockLessons.filter(
                      (l) => l.courseId === mockCourses.find((c) => c.title === courseTitle)?.courseId
                    )
                  : []
              }
              getOptionLabel={(opt) => opt.title}
              value={mockLessons.find((l) => l.title === lessonTitle) || null}
              onChange={(e, val) => {
                setLessonTitle(val?.title || "");
                setSelectedQuiz((prev) => ({ ...prev, lessonId: val?.lessonId || "" }));
              }}
              disabled={!courseTitle}
              renderInput={(params) => <TextField {...params} label="Bài giảng" />}
            />
          </Box>

          {/* Upload quiz file */}
          <Box mt={2}>
            <TextField
              label="URL File câu hỏi"
              fullWidth
              value={selectedQuiz?.questionFileUrl || ""}
              onChange={(e) =>
                setSelectedQuiz((prev) => ({ ...prev, questionFileUrl: e.target.value }))
              }
            />

            <Typography align="center" mt={1}>
              — hoặc —
            </Typography>

            <Button variant="outlined" component="label" startIcon={<UploadFileIcon />}>
              Upload file (.json)
              <input type="file" accept=".json" hidden onChange={handleUploadQuizFile} />
            </Button>

            {selectedQuiz?.uploadedFileName && (
              <Typography mt={1} color="text.secondary">
                📄 {selectedQuiz.uploadedFileName}
              </Typography>
            )}
          </Box>

          {/* Media */}
          <Box mt={3}>
            <TextField
              label="URL Media"
              fullWidth
              value={selectedQuiz?.mediaUrl || ""}
              onChange={(e) =>
                setSelectedQuiz((prev) => ({ ...prev, mediaUrl: e.target.value }))
              }
            />

            <Typography align="center" mt={1}>
              — hoặc —
            </Typography>

            <Button variant="outlined" component="label" startIcon={<UploadFileIcon />}>
              Upload Media
              <input
                type="file"
                accept="audio/*,video/*"
                hidden
                onChange={handleUploadMediaFile}
              />
            </Button>
          </Box>

          {/* Description */}
          <TextField
            label="Mô tả"
            fullWidth
            multiline
            rows={2}
            sx={{ mt: 3 }}
            value={selectedQuiz?.description || ""}
            onChange={(e) =>
              setSelectedQuiz((prev) => ({ ...prev, description: e.target.value }))
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSave}>
            {isEditMode ? "Lưu thay đổi" : "Thêm Quiz"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* PREVIEW DIALOG */}
      <Dialog
        open={openPreview}
        onClose={handleClosePreview}
        fullWidth
        maxWidth="lg"
        PaperProps={{ sx: { height: "90vh" } }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6">
                {isEditingDetails ? "Chỉnh sửa chi tiết Quiz" : "Xem trước Quiz"}
              </Typography>

              {selectedQuiz?.description && (
                <Typography variant="body2" color="text.secondary">
                  {selectedQuiz.description}
                </Typography>
              )}
            </Box>

            {!isEditingDetails && previewQuestions.length > 0 && (
              <Button variant="outlined" onClick={() => setIsEditingDetails(true)}>
                Chỉnh sửa
              </Button>
            )}
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          {/* MEDIA PREVIEW */}
          {previewMedia && (
            <Box mb={3} p={2} bgcolor="#f9f9f9" borderRadius={2} border="1px solid #e0e0e0">
              <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                🎧 Media Preview
              </Typography>

              {previewMedia.endsWith(".mp4") || previewMedia.endsWith(".webm") ? (
                <video controls style={{ width: "100%", maxHeight: "400px", borderRadius: 8 }}>
                  <source src={previewMedia} type="video/mp4" />
                </video>
              ) : (
                <audio controls style={{ width: "100%" }}>
                  <source src={previewMedia} type="audio/mpeg" />
                </audio>
              )}
            </Box>
          )}

          {/* QUESTIONS */}
          {previewQuestions.length === 0 ? (
            <Box py={4} textAlign="center">
              <Typography variant="h6">Không có câu hỏi trong quiz</Typography>
            </Box>
          ) : (
            previewQuestions.map((q, index) => (
              <QuestionPreviewCard
                key={index}
                question={q}
                index={index}
                isEditingDetails={isEditingDetails}
                onUpdateQuestion={handleUpdateQuestion}
                onUpdateOption={handleUpdateOption}
              />
            ))
          )}
        </DialogContent>

        <DialogActions>
          {isEditingDetails ? (
            <>
              <Button onClick={handleClosePreview}>Hủy</Button>
              <Button variant="contained" onClick={handleSaveQuizDetails}>
                Lưu thay đổi
              </Button>
            </>
          ) : (
            <Button onClick={() => setOpenPreview(false)}>Đóng</Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
