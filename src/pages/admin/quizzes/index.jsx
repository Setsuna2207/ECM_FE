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
  Autocomplete
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
// Import the quiz registry - ONLY NEW IMPORT!
import { getQuizById } from "../../../data/quiz/quizRegistry";

export default function ManageQuiz() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [quizzes, setQuizzes] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  const [lessonTitle, setLessonTitle] = useState("");
  const [courseTitle, setCourseTitle] = useState("");

  // Filter state
  const [filterCourse, setFilterCourse] = useState(null);
  const [filterLesson, setFilterLesson] = useState(null);

  // Preview
  const [openPreview, setOpenPreview] = useState(false);
  const [previewQuestions, setPreviewQuestions] = useState([]);
  const [previewMedia, setPreviewMedia] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Edit options dialog
  const [openEditOptions, setOpenEditOptions] = useState(false);
  const [selectedRowForEdit, setSelectedRowForEdit] = useState(null);
  const [isEditingDetails, setIsEditingDetails] = useState(false);

  // Load dữ liệu quiz
  useEffect(() => {
    const formatted = mockQuizzes.map((q, idx) => {
      const lesson = mockLessons.find(l => l.lessonId === q.lessonId);
      const course = lesson ? mockCourses.find(c => c.courseId === lesson.courseId) : null;
      return {
        ...q,
        id: q.quizId || idx + 1,
        description: q.description || "",
        mediaUrl: q.mediaUrl || "",
        lessonTitle: lesson ? lesson.title : "Không tìm thấy bài giảng",
        courseTitle: course ? course.title : "Không tìm thấy khóa học"
      };
    });
    setQuizzes(formatted);
  }, []);

  // Lọc quizzes theo course/lesson
  const filteredQuizzes = quizzes.filter(q => {
    const matchCourse = filterCourse ? q.courseTitle === filterCourse.title : true;
    const matchLesson = filterLesson ? q.lessonTitle === filterLesson.title : true;
    return matchCourse && matchLesson;
  });

  // Xử lý chọn Lesson
  const handleLessonChange = (lesson) => {
    if (!lesson) {
      setSelectedQuiz(prev => ({ ...prev, lessonId: "" }));
      setLessonTitle("");
      setCourseTitle("");
      return;
    }
    setSelectedQuiz(prev => ({ ...prev, lessonId: lesson.lessonId }));
    setLessonTitle(lesson.title);
    const course = mockCourses.find(c => c.courseId === lesson.courseId);
    setCourseTitle(course ? course.title : "");
  };

  // Upload file quiz
  const handleUploadQuizFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const fileUrl = URL.createObjectURL(file);
      
      // Try to parse and validate the quiz data
      let quizData = null;
      if (file.name.endsWith('.json')) {
        quizData = JSON.parse(text);
      } else if (file.name.endsWith('.js')) {
        alert("JS files uploaded will be stored but preview may not work. Consider using JSON format.");
      }
      
      setSelectedQuiz(prev => ({ 
        ...prev, 
        questionFileUrl: fileUrl, 
        uploadedFileName: file.name,
        uploadedQuizData: quizData
      }));
    } catch (error) {
      alert("Error reading quiz file. Please check the format.");
      console.error(error);
    }
  };

  // Upload media
  const handleUploadMediaFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fileUrl = URL.createObjectURL(file);
    setSelectedQuiz(prev => ({ ...prev, mediaUrl: fileUrl, uploadedMediaName: file.name }));
  };

  // Lưu quiz
  const handleSave = () => {
    if (!selectedQuiz.lessonId || !selectedQuiz.questionFileUrl) {
      alert("Vui lòng chọn bài giảng và upload file quiz!");
      return;
    }
    const updated = isEditMode
      ? quizzes.map(q => q.id === selectedQuiz.id ? selectedQuiz : q)
      : [{ ...selectedQuiz, id: quizzes.length + 1, quizId: quizzes.length + 1 }, ...quizzes];
    setQuizzes(updated);
    alert(isEditMode ? "Cập nhật thành công!" : "Đã thêm quiz mới!");
    setOpenDialog(false);
  };

  // Xem preview - Uses quizRegistry to load questions
  const handlePreview = async (quiz) => {
    setLoadingPreview(true);
    setPreviewQuestions([]);
    setPreviewMedia(quiz.mediaUrl || null);
    setIsEditingDetails(false);
    setOpenPreview(true);

    try {
      let questionsData = null;

      // Try uploaded data first (for newly uploaded quizzes)
      if (quiz.uploadedQuizData) {
        questionsData = quiz.uploadedQuizData.questions;
      }
      // Use quiz registry for existing quizzes (by quizId)
      else if (quiz.quizId) {
        const quizData = getQuizById(quiz.quizId);
        if (quizData && quizData.questions) {
          questionsData = quizData.questions;
        }
      }
      // Fallback: try to fetch from URL if it's a remote resource
      else if (quiz.questionFileUrl && quiz.questionFileUrl.startsWith('http')) {
        const response = await fetch(quiz.questionFileUrl);
        const data = await response.json();
        questionsData = data.questions;
      }

      if (questionsData && Array.isArray(questionsData)) {
        setPreviewQuestions(questionsData);
      } else {
        console.warn("No valid questions found for quiz:", quiz.quizId);
      }
    } catch (error) {
      console.error("Failed to load quiz questions:", error);
      alert("Không thể tải câu hỏi. Vui lòng kiểm tra file quiz.");
    } finally {
      setLoadingPreview(false);
    }
  };

  // Thêm, sửa, xóa quiz
  const handleAdd = () => {
    setSelectedQuiz({ lessonId: "", questionFileUrl: "", mediaUrl: "", description: "" });
    setLessonTitle("");
    setCourseTitle("");
    setIsEditMode(false);
    setOpenDialog(true);
  };

  const handleEdit = (row) => {
    setSelectedRowForEdit(row);
    setOpenEditOptions(true);
  };

  const handleEditInfo = () => {
    setSelectedQuiz({ ...selectedRowForEdit });
    const lesson = mockLessons.find(l => l.lessonId === selectedRowForEdit.lessonId);
    setLessonTitle(lesson ? lesson.title : "");
    const course = lesson ? mockCourses.find(c => c.courseId === lesson.courseId) : null;
    setCourseTitle(course ? course.title : "");
    setIsEditMode(true);
    setOpenEditOptions(false);
    setOpenDialog(true);
  };

  const handleEditDetails = () => {
    // Load quiz questions for editing
    try {
      const quizData = getQuizById(selectedRowForEdit.quizId);
      if (quizData && quizData.questions) {
        setPreviewQuestions(quizData.questions);
        setPreviewMedia(selectedRowForEdit.mediaUrl || null);
        setIsEditingDetails(true);
        setOpenEditOptions(false);
        setOpenPreview(true);
      } else {
        alert("Không tìm thấy câu hỏi để chỉnh sửa!");
      }
    } catch (error) {
      alert("Không thể tải câu hỏi!");
      console.error(error);
    }
  };

  const handleUpdateQuestion = (index, field, value) => {
    setPreviewQuestions(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleUpdateOption = (qIndex, optIndex, value) => {
    setPreviewQuestions(prev => {
      const updated = [...prev];
      updated[qIndex].options[optIndex] = value;
      return updated;
    });
  };

  const handleSaveQuizDetails = () => {
    // Save the edited questions back to the quiz
    // In production, you'd save this to your backend/database
    console.log("Saving quiz details:", previewQuestions);
    alert("Đã lưu thay đổi chi tiết quiz!");
    setIsEditingDetails(false);
    setOpenPreview(false);
  };

  const handleClosePreview = () => {
    if (isEditingDetails) {
      if (window.confirm("Bạn có thay đổi chưa lưu. Bạn có chắc muốn đóng?")) {
        setIsEditingDetails(false);
        setOpenPreview(false);
      }
    } else {
      setOpenPreview(false);
    }
  };

  const handleDelete = (row) => {
    if (window.confirm("Bạn có chắc muốn xóa quiz này không?")) {
      setQuizzes(prev => prev.filter(q => q.id !== row.id));
    }
  };

  const columns = [
    { field: "id", headerAlign: "center", align: "center", headerName: "QuizID", flex: 0.2 },
    { field: "lessonId", align: "center", headerAlign: "center", headerName: "LessonID", flex: 0.2 },
    { field: "lessonTitle", headerName: "Tên bài giảng", flex: 1, headerAlign: "center" },
    { field: "courseTitle", headerName: "Khóa học", flex: 1, headerAlign: "center" },
    {
      field: "questionFileUrl",
      headerName: "File câu hỏi",
      flex: 0.5,
      align: "center",
      headerAlign: "center",
      renderCell: params => (
        <Button color="secondary" startIcon={<VisibilityIcon />} onClick={() => handlePreview(params.row)}>
          Xem quiz
        </Button>
      )
    },
    {
      field: "mediaUrl",
      headerName: "Media",
      flex: 0.4,
      align: "center",
      headerAlign: "center",
      renderCell: params => params.value ? <VideoLibraryIcon sx={{ color: colors.greenAccent[300] }} /> : <Typography color="text.secondary">Không có</Typography>
    },
    {
      field: "actions",
      headerName: "Hành động",
      flex: 0.4,
      align: "center",
      headerAlign: "center",
      renderCell: params => (
        <>
          <IconButton color="primary" onClick={() => handleEdit(params.row)}><EditIcon /></IconButton>
          <IconButton color="error" onClick={() => handleDelete(params.row)}><DeleteIcon /></IconButton>
        </>
      )
    }
  ];

  return (
    <Box flex="1" overflow="auto" p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Header title="Quản lý Quiz" subtitle="Danh sách bài kiểm tra" />
        <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={handleAdd} sx={{ borderRadius: 2 }}>Thêm Quiz</Button>
      </Box>

      {/* Filter course → lesson */}
      <Box display="flex" gap={2} mb={2}>
        <Autocomplete
          sx={{ width: "45%" }}
          options={mockCourses}
          getOptionLabel={option => option.title || ""}
          value={filterCourse}
          onChange={(e, value) => {
            setFilterCourse(value || null);
            setFilterLesson(null);
          }}
          renderInput={params => <TextField {...params} label="Lọc theo khóa học" />}
        />
        <Autocomplete
          sx={{ width: "55%" }}
          options={filterCourse ? mockLessons.filter(l => l.courseId === filterCourse.courseId) : []}
          getOptionLabel={option => option.title || ""}
          value={filterLesson}
          onChange={(e, value) => setFilterLesson(value || null)}
          renderInput={params => <TextField {...params} label="Lọc theo bài giảng" />}
          disabled={!filterCourse}
        />
      </Box>

      {/* DataGrid */}
      <Box height="70vh" sx={{ "& .MuiDataGrid-columnHeaders": { background: colors.gray[900] } }}>
        <DataGrid rows={filteredQuizzes} columns={columns} getRowId={row => row.id} slots={{ toolbar: GridToolbar }} />
      </Box>

      {/* Dialog thêm/sửa quiz */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>{isEditMode ? "Chỉnh sửa Quiz" : "Thêm Quiz mới"}</DialogTitle>
        <DialogContent>
          <Box display="flex" gap={2} alignItems="center" mt={1}>
            <Autocomplete
              sx={{ width: "100%" }}
              options={mockCourses}
              getOptionLabel={option => option.title}
              value={mockCourses.find(c => c.title === courseTitle) || null}
              onChange={(e, value) => {
                if (value) {
                  setCourseTitle(value.title);
                  setLessonTitle("");
                  setSelectedQuiz(prev => ({ ...prev, lessonId: "" }));
                } else {
                  setCourseTitle("");
                  setLessonTitle("");
                  setSelectedQuiz(prev => ({ ...prev, lessonId: "" }));
                }
              }}
              renderInput={params => <TextField {...params} label="Khóa học" />}
            />
          </Box>

          <Box mt={2}>
            <Autocomplete
              sx={{ width: "100%" }}
              options={courseTitle ? mockLessons.filter(l => l.courseId === mockCourses.find(c => c.title === courseTitle)?.courseId) : []}
              getOptionLabel={option => option.title}
              value={mockLessons.find(l => l.title === lessonTitle) || null}
              onChange={(e, value) => handleLessonChange(value)}
              renderInput={params => <TextField {...params} label="Bài giảng" />}
              disabled={!courseTitle}
            />
          </Box>

          {/* File quiz */}
          <Box mt={2}>
            <TextField
              label="URL File câu hỏi"
              fullWidth
              value={selectedQuiz?.questionFileUrl || ""}
              onChange={(e) => setSelectedQuiz({ ...selectedQuiz, questionFileUrl: e.target.value })}
            />
            <Typography align="center" mt={1} mb={1}>— hoặc —</Typography>
            <Button variant="outlined" component="label" startIcon={<UploadFileIcon />} sx={{ borderRadius: 2 }}>
              Upload file câu hỏi (.json)
              <input type="file" accept=".js,.json" hidden onChange={handleUploadQuizFile} />
            </Button>
            {selectedQuiz?.uploadedFileName && <Typography mt={1} color="text.secondary">📄 {selectedQuiz.uploadedFileName}</Typography>}
          </Box>

          {/* File media */}
          <Box mt={3}>
            <TextField
              label="URL File âm thanh/video"
              fullWidth
              value={selectedQuiz?.mediaUrl || ""}
              onChange={e => setSelectedQuiz({ ...selectedQuiz, mediaUrl: e.target.value })}
            />
            <Typography align="center" mt={1} mb={1}>— hoặc —</Typography>
            <Button variant="outlined" component="label" startIcon={<UploadFileIcon />} sx={{ borderRadius: 2 }}>
              Upload file âm thanh/video
              <input type="file" accept="audio/*,video/*" hidden onChange={handleUploadMediaFile} />
            </Button>
            {selectedQuiz?.mediaUrl && (
              <Box mt={2}>
                {selectedQuiz.mediaUrl.endsWith(".mp4") ? (
                  <video controls width="100%" style={{ borderRadius: 8 }}>
                    <source src={selectedQuiz.mediaUrl} type="video/mp4" />
                  </video>
                ) : (
                  <audio controls style={{ width: "100%" }}>
                    <source src={selectedQuiz.mediaUrl} type="audio/mpeg" />
                  </audio>
                )}
              </Box>
            )}
          </Box>

          {/* Mô tả */}
          <TextField
            margin="dense"
            label="Mô tả"
            fullWidth
            multiline
            rows={2}
            sx={{ mt: 3 }}
            value={selectedQuiz?.description || ""}
            onChange={e => setSelectedQuiz({ ...selectedQuiz, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button variant="contained" color="primary" onClick={handleSave}>{isEditMode ? "Lưu thay đổi" : "Thêm mới"}</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog chọn loại chỉnh sửa */}
      <Dialog open={openEditOptions} onClose={() => setOpenEditOptions(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Chọn loại chỉnh sửa</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleEditDetails}
              sx={{ 
                py: 2, 
                borderRadius: 2,
                textTransform: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5
              }}
            >
              <Typography variant="body1" fontWeight={600}>
                Chỉnh sửa chi tiết quiz
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Sửa câu hỏi/đáp án
              </Typography>
            </Button>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              onClick={handleEditInfo}
              sx={{ 
                py: 2, 
                borderRadius: 2,
                textTransform: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5
              }}
            >
              <Typography variant="body1" fontWeight={600}>
                Chỉnh sửa thông tin quiz
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Sửa khóa học, bài giảng, media
              </Typography>
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditOptions(false)}>Hủy</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog preview quiz */}
      <Dialog open={openPreview} onClose={handleClosePreview} fullWidth maxWidth="md">
        <DialogTitle>{isEditingDetails ? "Chỉnh sửa chi tiết quiz" : "Xem trước bài quiz"}</DialogTitle>
        <DialogContent dividers>
          {previewMedia && (
            <Box mb={2}>
              {previewMedia.endsWith(".mp4") ? (
                <video controls style={{ width: "100%" }}>
                  <source src={previewMedia} type="video/mp4" />
                </video>
              ) : (
                <audio controls style={{ width: "100%" }}>
                  <source src={previewMedia} type="audio/mpeg" />
                </audio>
              )}
            </Box>
          )}
          {loadingPreview ? (
            <Typography>Đang tải câu hỏi...</Typography>
          ) : previewQuestions.length === 0 ? (
            <Typography>Không có câu hỏi trong file này.</Typography>
          ) : (
            previewQuestions.map((q, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent>
                  {isEditingDetails ? (
                    <>
                      <TextField
                        fullWidth
                        label={`Câu ${index + 1}`}
                        value={q.question}
                        onChange={(e) => handleUpdateQuestion(index, 'question', e.target.value)}
                        sx={{ mb: 2 }}
                        multiline
                      />
                      {q.options.map((opt, i) => (
                        <Box key={i} display="flex" alignItems="center" gap={1} mb={1}>
                          <Radio
                            checked={q.correctAnswer === i}
                            onChange={() => handleUpdateQuestion(index, 'correctAnswer', i)}
                          />
                          <TextField
                            fullWidth
                            size="small"
                            label={`Đáp án ${i + 1}`}
                            value={opt}
                            onChange={(e) => handleUpdateOption(index, i, e.target.value)}
                          />
                        </Box>
                      ))}
                    </>
                  ) : (
                    <>
                      <Typography fontWeight={600}>Câu {index + 1}: {q.question}</Typography>
                      <RadioGroup>
                        {q.options.map((opt, i) => (
                          <FormControlLabel
                            key={i}
                            value={i}
                            control={<Radio disabled />}
                            label={<Typography sx={{ color: q.correctAnswer === i ? "green" : "inherit", fontWeight: q.correctAnswer === i ? 600 : 400 }}>{opt}</Typography>}
                          />
                        ))}
                      </RadioGroup>
                    </>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </DialogContent>
        <DialogActions>
          {isEditingDetails ? (
            <>
              <Button onClick={handleClosePreview}>Hủy</Button>
              <Button variant="contained" color="primary" onClick={handleSaveQuizDetails}>Lưu thay đổi</Button>
            </>
          ) : (
            <Button onClick={() => setOpenPreview(false)}>Đóng</Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}