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
  CircularProgress,
  alpha,
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
import api from "../../../services/axios/axios.customize";

// Backend API services
import {
  GetAllQuizzes,
  GetQuizById,
  CreateQuiz,
  UpdateQuiz,
  DeleteQuiz,
} from "../../../services/quizService";

import {
  GetAllLessons,
  GetLessonByCourseId,
} from "../../../services/lessonService";

import {
  GetAllCourses,
} from "../../../services/courseService";

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

  // Data from backend
  const [quizzes, setQuizzes] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

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

  // Fetch all data from backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch courses
        const coursesRes = await GetAllCourses();
        const coursesData = Array.isArray(coursesRes.data) ? coursesRes.data : [];
        const formattedCourses = coursesData.map(c => ({
          ...c,
          courseId: c.courseID || c.courseId || c.id,
          title: c.title || c.courseName || "Untitled"
        }));
        setCourses(formattedCourses);

        // Fetch lessons
        const lessonsRes = await GetAllLessons();
        const lessonsData = Array.isArray(lessonsRes.data) ? lessonsRes.data : [];
        const formattedLessons = lessonsData.map(l => ({
          ...l,
          lessonId: l.lessonID || l.lessonId || l.id,
          courseId: l.courseID || l.courseId,
          title: l.title || "Untitled"
        }));
        setLessons(formattedLessons);

        // Fetch quizzes
        const quizzesRes = await GetAllQuizzes();
        const quizzesData = Array.isArray(quizzesRes.data) ? quizzesRes.data : [];
        console.log("Raw quizzes from backend:", quizzesData); // DEBUG
        const formattedQuizzes = quizzesData.map((q, idx) => {
          const lesson = formattedLessons.find((l) => l.lessonId === (q.lessonID || q.lessonId));
          const course = lesson ? formattedCourses.find((c) => c.courseId === lesson.courseId) : null;

          // Extract questions - handle both flat array and nested sections structure
          let questions = null;
          if (q.questions && Array.isArray(q.questions)) {
            questions = q.questions;
          } else if (q.sections && Array.isArray(q.sections)) {
            questions = q.sections.flatMap(section => section.questions || []);
          }

          console.log("Quiz questions:", questions); // DEBUG
          return {
            ...q,
            id: q.quizID || q.quizId || q.id || idx + 1,
            quizId: q.quizID || q.quizId || q.id,
            lessonId: q.lessonID || q.lessonId,
            lessonTitle: lesson ? lesson.title : "Không tìm thấy bài giảng",
            courseTitle: course ? course.title : "Không tìm thấy khóa học",
            uploadedQuizData: questions ? { questions } : null, // Store questions from backend
          };
        });
        setQuizzes(formattedQuizzes);
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Không thể tải dữ liệu. Vui lòng thử lại!");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredQuizzes = quizzes.filter((q) => {
    const matchCourse = filterCourse ? q.courseTitle === filterCourse.title : true;
    const matchLesson = filterLesson ? q.lessonTitle === filterLesson.title : true;
    return matchCourse && matchLesson;
  });

  // Helper function to refresh quizzes from backend
  const refreshQuizzes = async () => {
    try {
      const quizzesRes = await GetAllQuizzes();
      const quizzesData = Array.isArray(quizzesRes.data) ? quizzesRes.data : [];

      const formattedQuizzes = quizzesData.map((q, idx) => {
        const lesson = lessons.find((l) => l.lessonId === (q.lessonID || q.lessonId));
        const course = lesson ? courses.find((c) => c.courseId === lesson.courseId) : null;

        let questions = null;
        if (q.questions && Array.isArray(q.questions)) {
          questions = q.questions;
        } else if (q.sections && Array.isArray(q.sections)) {
          questions = q.sections.flatMap(section => section.questions || []);
        }

        return {
          ...q,
          id: q.quizID || q.quizId || q.id || idx + 1,
          quizId: q.quizID || q.quizId || q.id,
          lessonId: q.lessonID || q.lessonId,
          lessonTitle: lesson ? lesson.title : "Không tìm thấy bài giảng",
          courseTitle: course ? course.title : "Không tìm thấy khóa học",
          uploadedQuizData: questions ? { questions } : null,
        };
      });
      setQuizzes(formattedQuizzes);
    } catch (error) {
      console.error("Error refreshing quizzes:", error);
    }
  };

  const handleUploadQuizFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!selectedQuiz.lessonId) {
      alert("Vui lòng chọn bài giảng trước khi upload file");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      // Build URL with quizId if editing
      let uploadUrl = `/Quiz/upload?lessonId=${selectedQuiz.lessonId}&description=${encodeURIComponent(selectedQuiz.description || "")}`;
      if (isEditMode && selectedQuiz.quizId) {
        uploadUrl += `&quizId=${selectedQuiz.quizId}`;
        console.log("Editing quiz with ID:", selectedQuiz.quizId);
      } else {
        console.log("Creating new quiz");
      }

      console.log("Upload URL:", uploadUrl);

      const uploadRes = await api.post(uploadUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const { quizId, questions } = uploadRes.data;

      if (!questions || questions.length === 0) {
        throw new Error("No questions found in file");
      }

      // Update selectedQuiz with the created/updated quiz data
      setSelectedQuiz((prev) => ({
        ...prev,
        quizId: quizId,
        uploadedFileName: file.name,
        uploadedQuizData: { questions },
      }));

      alert(`✅ Tải file thành công! (${questions.length} câu hỏi)`);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert(`❌ Lỗi tải file: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadMediaFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await api.post('/Quiz/upload-media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const mediaUrl = uploadRes.data.mediaUrl;

      setSelectedQuiz((prev) => ({
        ...prev,
        mediaUrl: mediaUrl,
        uploadedMediaName: file.name,
      }));

      alert(`✅ Tải media thành công!`);
    } catch (error) {
      console.error("Error uploading media:", error);
      alert(`❌ Lỗi tải media: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
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

    // Find lesson from backend data
    const lesson = lessons.find((l) => l.lessonId === row.lessonId);
    setLessonTitle(lesson?.title || "");

    // Find course from backend data
    const course = courses.find((c) => c.courseId === lesson?.courseId);
    setCourseTitle(course?.title || "");

    setIsEditMode(true);
    setOpenDialog(true);
  };

  const handleDelete = async (row) => {
    if (!window.confirm("Xóa quiz này?")) return;

    try {
      setLoading(true);
      const quizId = row.quizId || row.id;
      await DeleteQuiz(quizId);
      alert("Xóa thành công!");
      await refreshQuizzes();
    } catch (error) {
      console.error("Error deleting quiz:", error);
      alert("Không thể xóa quiz. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedQuiz.lessonId) {
      return alert("Vui lòng chọn bài giảng.");
    }

    if (!selectedQuiz.uploadedQuizData || !selectedQuiz.uploadedQuizData.questions) {
      return alert("Vui lòng upload file quiz.");
    }

    try {
      setLoading(true);

      // If quiz was just created from upload, it's already in DB
      if (selectedQuiz.quizId && !isEditMode) {
        // Just update media and description if needed
        const quizData = {
          lessonID: selectedQuiz.lessonId,
          questionFileUrl: selectedQuiz.questionFileUrl || "",
          mediaUrl: selectedQuiz.mediaUrl || "",
          description: selectedQuiz.description || "",
        };

        await UpdateQuiz(selectedQuiz.quizId, quizData);
        alert("Cập nhật thành công!");
      } else if (isEditMode) {
        // Update existing quiz
        const quizId = selectedQuiz.quizId || selectedQuiz.id;
        const quizData = {
          lessonID: selectedQuiz.lessonId,
          questionFileUrl: selectedQuiz.questionFileUrl || "",
          mediaUrl: selectedQuiz.mediaUrl || "",
          description: selectedQuiz.description || "",
        };

        await UpdateQuiz(quizId, quizData);
        alert("Cập nhật thành công!");
      }

      setOpenDialog(false);
      await refreshQuizzes();
    } catch (error) {
      console.error("Error saving quiz:", error);
      alert("Không thể lưu quiz. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  /* PREVIEW LOADER - Loads questions from file URL */
  const handlePreview = async (q) => {
    setOpenPreview(true);
    setIsEditingDetails(false);
    setPreviewMedia(q.mediaUrl || null);

    let questions = null;

    console.log("Preview quiz:", q);
    console.log("Has uploadedQuizData:", !!q.uploadedQuizData);
    console.log("uploadedQuizData content:", q.uploadedQuizData);
    console.log("q.questions:", q.questions);
    console.log("q.sections:", q.sections);

    // Try to get questions from uploaded data (stored during add/edit)
    if (q.uploadedQuizData && q.uploadedQuizData.questions) {
      questions = q.uploadedQuizData.questions;
      console.log("Loaded questions from uploadedQuizData:", questions.length);
    } else if (q.questions && Array.isArray(q.questions)) {
      // Direct questions from backend response
      questions = q.questions;
      console.log("Loaded questions directly from q.questions:", questions.length);
    } else if (q.sections && Array.isArray(q.sections)) {
      // Nested sections structure - flatten all questions
      questions = q.sections.flatMap(section => section.questions || []);
      console.log("Loaded questions from sections:", questions.length);
    } else if (q.questionFileUrl) {
      // Fetch the quiz file from the URL
      try {
        console.log("Fetching quiz file from URL:", q.questionFileUrl);

        // Build full URL - the backend returns relative paths like "/uploads/..."
        let fileUrl = q.questionFileUrl;
        if (!fileUrl.startsWith('http')) {
          fileUrl = `https://localhost:7264${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;
        }

        console.log("Full file URL:", fileUrl);

        const fileRes = await fetch(fileUrl);
        if (!fileRes.ok) throw new Error(`Failed to fetch quiz file: ${fileRes.status}`);

        const text = await fileRes.text();
        console.log("File content length:", text.length);
        let quizData = null;

        if (q.questionFileUrl.endsWith('.js')) {
          // For .js files, extract the export default object
          const match = text.match(/export\s+default\s+({[\s\S]*})/);
          if (match) {
            try {
              quizData = eval('(' + match[1] + ')');
            } catch (e) {
              console.error("Error parsing JS file:", e);
              // Try JSON parse as fallback
              quizData = JSON.parse(match[1]);
            }
          }
        } else if (q.questionFileUrl.endsWith('.json')) {
          quizData = JSON.parse(text);
        }

        console.log("Parsed quiz data:", quizData);

        // Extract questions - handle both flat array and nested sections structure
        if (quizData) {
          if (quizData.questions && Array.isArray(quizData.questions)) {
            // Direct questions array
            questions = quizData.questions;
            console.log("Found direct questions array:", questions.length);
          } else if (quizData.sections && Array.isArray(quizData.sections)) {
            // Nested sections structure - flatten all questions
            questions = quizData.sections.flatMap(section => section.questions || []);
            console.log("Found questions in sections:", questions.length);
          }

          if (questions && questions.length > 0) {
            console.log("Loaded questions from file:", questions.length);

            // Cache in state for future previews
            setQuizzes((prev) =>
              prev.map((quiz) =>
                (quiz.quizId || quiz.id) === (q.quizId || q.id)
                  ? { ...quiz, uploadedQuizData: { questions } }
                  : quiz
              )
            );
          }
        }
      } catch (error) {
        console.error("Error fetching quiz file:", error);
        alert(`❌ Không thể tải file quiz: ${error.message}`);
      }
    }

    console.log("Final questions to display:", questions);
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

      {/* FILTERS - Using backend data */}
      <Box display="flex" gap={2} mb={2}>
        <Autocomplete
          sx={{ width: "40%" }}
          options={courses}
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
          options={filterCourse ? lessons.filter((l) => l.courseId === filterCourse.courseId) : []}
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

      {/* DIALOG ADD/EDIT - Using backend data */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditMode ? "Chỉnh sửa Quiz" : "Thêm Quiz mới"}</DialogTitle>
        <DialogContent>
          <Box mt={1}>
            <Autocomplete
              options={courses}
              getOptionLabel={(opt) => opt.title}
              value={courses.find((c) => c.title === courseTitle) || null}
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
                  ? lessons.filter(
                    (l) => l.courseId === courses.find((c) => c.title === courseTitle)?.courseId
                  )
                  : []
              }
              getOptionLabel={(opt) => opt.title}
              value={lessons.find((l) => l.title === lessonTitle) || null}
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
            <Button variant="outlined" component="label" startIcon={<UploadFileIcon />} fullWidth>
              Upload file (.js hoặc .json)
              <input type="file" accept=".js,.json" hidden onChange={handleUploadQuizFile} />
            </Button>

            {selectedQuiz?.uploadedFileName && (
              <Typography mt={1} color="success.main" fontWeight="500">
                ✅ {selectedQuiz.uploadedFileName} ({selectedQuiz.uploadedQuizData?.questions?.length || 0} câu hỏi)
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
          <Button variant="contained" onClick={handleSave} disabled={!selectedQuiz?.uploadedQuizData}>
            {isEditMode ? "Lưu thay đổi" : "Hoàn tất"}
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
                  <source src={previewMedia.startsWith('http') ? previewMedia : `https://localhost:7264${previewMedia.startsWith('/') ? '' : '/'}${previewMedia}`} type="video/mp4" />
                </video>
              ) : (
                <audio controls style={{ width: "100%" }}>
                  <source src={previewMedia.startsWith('http') ? previewMedia : `https://localhost:7264${previewMedia.startsWith('/') ? '' : '/'}${previewMedia}`} type="audio/mpeg" />
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
