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
  Card,
  CardContent,
  RadioGroup,
  Radio,
  FormControlLabel,
  Autocomplete,
  Chip,
  Paper,
  Divider,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import QuizIcon from "@mui/icons-material/Quiz";
import ArticleIcon from "@mui/icons-material/Article";
import Header from "../../../components/Header";
import { mockTests } from "../../../data/mockTest";
import { getTestById } from "../../../data/test/testRegistry";

const testCategories = ["TOEIC", "TOEFL", "IELTS", "GENERAL"];

// Question Preview Component
function QuestionPreviewCard({ question, index, isEditingDetails, onUpdateQuestion, onUpdateOption }) {
  return (
    <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
      <CardContent sx={{ p: 3 }}>
        {question.sectionTitle && (
          <Chip label={question.sectionTitle} size="small" color="info" sx={{ mb: 2 }} />
        )}
        
        {isEditingDetails ? (
          <>
            <TextField
              fullWidth
              label={`Câu ${question.questionId || index + 1}`}
              value={question.question}
              onChange={(e) => onUpdateQuestion(index, 'question', e.target.value)}
              sx={{ mb: 2 }}
              multiline
            />
            
            {question.passage !== undefined && (
              <TextField
                fullWidth
                label="Đoạn văn (Reading Passage)"
                value={question.passage || ""}
                onChange={(e) => onUpdateQuestion(index, 'passage', e.target.value)}
                sx={{ mb: 2 }}
                multiline
                rows={6}
              />
            )}
            
            {question.options?.map((opt, i) => (
              <Box key={i} display="flex" alignItems="center" gap={1} mb={1}>
                <Radio
                  checked={question.correctAnswer === i}
                  onChange={() => onUpdateQuestion(index, 'correctAnswer', i)}
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
            <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
              <Typography variant="h6" fontWeight="600" color="primary">
                Câu {question.questionId || index + 1}
              </Typography>
              {question.points && (
                <Chip label={`${question.points} điểm`} size="small" color="success" variant="outlined" />
              )}
            </Box>
            
            {question.passage && (
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3, 
                  mb: 3, 
                  backgroundColor: "#f8f9fa",
                  border: "2px solid #e3f2fd",
                  borderLeft: "5px solid #2196f3",
                  borderRadius: 2,
                }}
              >
                <Box 
                  sx={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 1, 
                    mb: 2,
                    pb: 1.5,
                    borderBottom: "1px solid #e0e0e0"
                  }}
                >
                  <ArticleIcon sx={{ color: "#2196f3", fontSize: 24 }} />
                  <Typography 
                    variant="subtitle2" 
                    fontWeight="700" 
                    color="primary"
                    sx={{ textTransform: "uppercase", letterSpacing: 1 }}
                  >
                    Reading Passage
                  </Typography>
                </Box>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    lineHeight: 1.8,
                    color: "#2c3e50",
                    fontSize: "1rem",
                    whiteSpace: "pre-line",
                    fontFamily: "'Georgia', serif"
                  }}
                >
                  {question.passage}
                </Typography>
              </Paper>
            )}
            
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="body1" fontWeight="500" mb={2} color="text.primary">
              {question.question}
            </Typography>
            
            {question.audioTimestamp && (
              <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                🎧 Audio: {question.audioTimestamp}
              </Typography>
            )}
            
            {question.options && (
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
                            fontWeight: question.correctAnswer === i ? 600 : 400 
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
            )}
            
            {question.type && (
              <Box mt={2}>
                <Chip label={question.type} size="small" variant="outlined" />
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function ManageTest() {
  const [tests, setTests] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [filterCategory, setFilterCategory] = useState(null);
  const [searchName, setSearchName] = useState("");
  const [openPreview, setOpenPreview] = useState(false);
  const [previewTest, setPreviewTest] = useState(null);
  const [previewQuestions, setPreviewQuestions] = useState([]);
  const [previewSections, setPreviewSections] = useState([]);
  const [previewMedia, setPreviewMedia] = useState(null);
  const [isEditingDetails, setIsEditingDetails] = useState(false);

  useEffect(() => {
    const formatted = mockTests.map((t, idx) => ({
      ...t,
      id: t.testId || idx + 1,
      name: t.title || t.name || "",
      title: t.title || t.name || "",
      description: t.description || "",
      category: t.category || "GENERAL",
      duration: t.duration || 60,
      totalQuestions: t.totalQuestions || 0,
      level: t.level || "All Levels"
    }));
    setTests(formatted);
  }, []);

  const filteredTests = tests.filter(t => {
    const matchCategory = filterCategory ? t.category === filterCategory : true;
    const matchName = searchName 
      ? (t.name?.toLowerCase().includes(searchName.toLowerCase()) || 
         t.title?.toLowerCase().includes(searchName.toLowerCase()))
      : true;
    return matchCategory && matchName;
  });

  const handleUploadTestFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const fileUrl = URL.createObjectURL(file);
      let testData = null;
      if (file.name.endsWith('.json')) testData = JSON.parse(text);
      setSelectedTest(prev => ({
        ...prev,
        questionFileUrl: fileUrl,
        uploadedFileName: file.name,
        uploadedTestData: testData
      }));
    } catch (error) {
      alert("Lỗi đọc file test. Kiểm tra định dạng.");
      console.error(error);
    }
  };

  const handleUploadMediaFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fileUrl = URL.createObjectURL(file);
    setSelectedTest(prev => ({ ...prev, mediaUrl: fileUrl, uploadedMediaName: file.name }));
  };

  const handleAdd = () => {
    setSelectedTest({ 
      name: "", title: "", category: "GENERAL", 
      questionFileUrl: "", mediaUrl: "", description: "",
      duration: 60, totalQuestions: 0, level: "All Levels"
    });
    setIsEditMode(false);
    setOpenDialog(true);
  };

  const handleEdit = (row) => {
    setSelectedTest({ ...row });
    setIsEditMode(true);
    setOpenDialog(true);
  };

  const handleDelete = (row) => {
    if (window.confirm("Bạn có chắc muốn xóa test này không?")) {
      setTests(prev => prev.filter(t => t.id !== row.id));
    }
  };

  const handleSave = () => {
    if (!selectedTest.category || !selectedTest.name) {
      alert("Nhập tiêu đề và chọn danh mục!");
      return;
    }
    
    const testToSave = {
      ...selectedTest,
      title: selectedTest.name,
      testId: isEditMode ? selectedTest.testId : `custom_${Date.now()}`
    };
    
    const updated = isEditMode
      ? tests.map(t => t.id === selectedTest.id ? testToSave : t)
      : [{ ...testToSave, id: tests.length + 1 }, ...tests];
    setTests(updated);
    alert(isEditMode ? "Cập nhật thành công!" : "Đã thêm test mới!");
    setOpenDialog(false);
  };

  const handlePreview = async (test) => {
    setPreviewTest(test);
    setPreviewQuestions([]);
    setPreviewSections([]);
    setPreviewMedia(null);
    setIsEditingDetails(false);
    setOpenPreview(true);
    
    try {
      let testData = null;
      let mediaUrl = null;
      
      if (test.uploadedTestData) {
        testData = test.uploadedTestData;
      } else if (test.testId) {
        testData = getTestById(test.testId);
      }
      
      if (test.mediaUrl) {
        mediaUrl = test.mediaUrl;
      } else if (testData?.sections) {
        const sectionWithMedia = testData.sections.find(s => s.mediaUrl);
        if (sectionWithMedia) mediaUrl = sectionWithMedia.mediaUrl;
      }
      
      setPreviewMedia(mediaUrl);
      
      if (testData) {
        if (testData.sections && Array.isArray(testData.sections)) {
          setPreviewSections(testData.sections);
          const allQuestions = [];
          testData.sections.forEach(section => {
            if (section.questions && Array.isArray(section.questions)) {
              section.questions.forEach(q => {
                allQuestions.push({
                  ...q,
                  sectionTitle: section.title,
                  sectionId: section.sectionId
                });
              });
            }
          });
          setPreviewQuestions(allQuestions);
        } else if (testData.questions && Array.isArray(testData.questions)) {
          setPreviewQuestions(testData.questions);
        }
      }
    } catch (error) {
      console.error("Error loading test:", error);
      alert("Không thể tải câu hỏi test.");
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

  const handleSaveTestDetails = () => {
    console.log("Saving test details:", previewQuestions);
    alert("Đã lưu thay đổi chi tiết test!");
    setIsEditingDetails(false);
  };

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "name", headerName: "Tiêu đề", flex: 1, minWidth: 300 },
    { 
      field: "description", 
      headerName: "Mô tả", 
      flex: 1, 
      minWidth: 400,
      renderCell: params => (
        <Typography variant="body2" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {params.value || "Chưa có mô tả"}
        </Typography>
      )
    },
    {
      field: "actions",
      headerName: "Hành động",
      width: 180,
      sortable: false,
      renderCell: params => (
        <Box display="flex" gap={1}>
          <IconButton color="info" size="small" onClick={() => handlePreview(params.row)} title="Xem trước">
            <VisibilityIcon />
          </IconButton>
          <IconButton color="primary" size="small" onClick={() => handleEdit(params.row)} title="Chỉnh sửa">
            <EditIcon />
          </IconButton>
          <IconButton color="error" size="small" onClick={() => handleDelete(params.row)} title="Xóa">
            <DeleteIcon />
          </IconButton>
        </Box>
      )
    }
  ];

  return (
    <Box flex="1" overflow="auto" p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Header title="Quản lý Test" subtitle="Danh sách bài kiểm tra" />
        <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={handleAdd} sx={{ borderRadius: 2 }}>
          Thêm Test
        </Button>
      </Box>

      <Box display="flex" gap={2} mb={2}>
        <TextField label="Tìm kiếm theo tên" variant="outlined" value={searchName} onChange={(e) => setSearchName(e.target.value)} sx={{ width: "40%" }} />
        <Autocomplete sx={{ width: "30%" }} options={testCategories} value={filterCategory} onChange={(e, value) => setFilterCategory(value || null)} renderInput={params => <TextField {...params} label="Lọc theo danh mục" />} />
        {(filterCategory || searchName) && (
          <Button variant="outlined" onClick={() => { setFilterCategory(null); setSearchName(""); }}>Xóa bộ lọc</Button>
        )}
      </Box>

      <Box height="70vh">
        <DataGrid rows={filteredTests} columns={columns} getRowId={row => row.id} slots={{ toolbar: GridToolbar }} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} pageSizeOptions={[5, 10, 25, 50]} />
      </Box>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        {/* ... existing dialog code ... */}
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={openPreview} onClose={() => setOpenPreview(false)} fullWidth maxWidth="lg" PaperProps={{ sx: { height: '90vh' } }}>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6">{isEditingDetails ? "Chỉnh sửa chi tiết test" : "Xem trước test"}</Typography>
              {previewTest && (
                <Typography variant="body2" color="text.secondary">{previewTest.name} - {previewTest.category}</Typography>
              )}
            </Box>
            {!isEditingDetails && previewQuestions.length > 0 && (
              <Button variant="outlined" onClick={() => setIsEditingDetails(true)}>Chỉnh sửa</Button>
            )}
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          {previewTest && (
            <Box mb={3} p={2} bgcolor="#f5f5f5" borderRadius={2}>
              <Typography variant="subtitle1" fontWeight="bold">Thông tin test</Typography>
              <Box display="flex" gap={2} mt={1} flexWrap="wrap">
                <Chip icon={<AccessTimeIcon />} label={`${previewTest.duration} phút`} />
                <Chip icon={<QuizIcon />} label={`${previewTest.totalQuestions} câu hỏi`} />
                <Chip label={previewTest.level} color="primary" />
                <Chip label={previewTest.category} color="secondary" />
              </Box>
              {previewTest.description && (
                <Typography variant="body2" mt={1} color="text.secondary">{previewTest.description}</Typography>
              )}
            </Box>
          )}

          {previewMedia && (
            <Box mb={3} p={2} bgcolor="#f9f9f9" borderRadius={2} border="1px solid #e0e0e0">
              <Typography variant="subtitle1" fontWeight="bold" mb={2}>🎧 Media Preview</Typography>
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

          {previewQuestions.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary">Không có câu hỏi trong test này</Typography>
            </Box>
          ) : (
            <>
              <Typography variant="subtitle2" mb={2} color="text.secondary">Tổng số: {previewQuestions.length} câu hỏi</Typography>
              
              {previewSections.length > 0 ? (
                previewSections.map((section, idx) => (
                  <Box key={idx} mb={4}>
                    <Paper sx={{ p: 2, mb: 2, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", borderRadius: 2 }}>
                      <Typography variant="h6" fontWeight="700">{section.title}</Typography>
                      {section.description && <Typography variant="body2" sx={{ opacity: 0.95 }}>{section.description}</Typography>}
                    </Paper>
                    
                    {section.questions?.map((q, qIdx) => (
                      <QuestionPreviewCard
                        key={qIdx}
                        question={{ ...q, sectionTitle: section.title }}
                        index={qIdx}
                        isEditingDetails={isEditingDetails}
                        onUpdateQuestion={handleUpdateQuestion}
                        onUpdateOption={handleUpdateOption}
                      />
                    ))}
                  </Box>
                ))
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
            </>
          )}
        </DialogContent>
        
        <DialogActions>
          {isEditingDetails ? (
            <>
              <Button onClick={() => setIsEditingDetails(false)}>Hủy</Button>
              <Button variant="contained" color="primary" onClick={handleSaveTestDetails}>Lưu thay đổi</Button>
            </>
          ) : (
            <Button onClick={() => setOpenPreview(false)}>Đóng</Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}