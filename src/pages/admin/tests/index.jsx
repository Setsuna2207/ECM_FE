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
  Chip
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import QuizIcon from "@mui/icons-material/Quiz";
import Header from "../../../components/Header";
import { mockTests } from "../../../data/mockTest";
import { getTestById } from "../../../data/test/testRegistry";

const testCategories = ["TOEIC", "TOEFL", "IELTS", "GENERAL"];

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
  const [isEditingDetails, setIsEditingDetails] = useState(false);

  useEffect(() => {
    const formatted = mockTests.map((t, idx) => ({
      ...t,
      id: t.testId || idx + 1,
      name: t.title || t.name || "", // Map title to name
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
      name: "", 
      title: "",
      category: "GENERAL", 
      questionFileUrl: "", 
      mediaUrl: "", 
      description: "",
      duration: 60,
      totalQuestions: 0,
      level: "All Levels"
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
      title: selectedTest.name, // Ensure title matches name
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
    console.log("Preview test:", test);
    setPreviewTest(test);
    setPreviewQuestions([]);
    setIsEditingDetails(false);
    setOpenPreview(true);
    
    try {
      let testData = null;
      
      // Try uploaded test data first
      if (test.uploadedTestData) {
        testData = test.uploadedTestData;
        console.log("Using uploaded test data");
      } 
      // Then try registry
      else if (test.testId) {
        testData = getTestById(test.testId);
        console.log("Test data from registry:", testData);
      }
      
      if (testData) {
        // Check if questions are in sections or directly in questions array
        if (testData.sections && Array.isArray(testData.sections)) {
          // Flatten all questions from all sections
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
          console.log("Loaded questions from sections:", allQuestions.length);
        } 
        else if (testData.questions && Array.isArray(testData.questions)) {
          setPreviewQuestions(testData.questions);
          console.log("Loaded questions directly:", testData.questions.length);
        }
      } else {
        console.log("No test data found");
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
    { field: "id", headerName: "ID", flex: 0.3 },
    { field: "name", headerName: "Tiêu đề", flex: 1, flex: 0.4 },
    { 
      field: "description", 
      headerName: "Mô tả", 
      flex: 1, 
      minWidth: 400,
      renderCell: params => (
        <Typography 
          variant="body2" 
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}
        >
          {params.value || "Chưa có mô tả"}
        </Typography>
      )
    },
    {
      field: "actions",
      headerName: "Hành động",
      flex: 0.3,
      sortable: false,
      renderCell: params => (
        <Box display="flex" gap={1}>
          <IconButton 
            color="info" 
            size="small"
            onClick={() => handlePreview(params.row)}
            title="Xem trước"
          >
            <VisibilityIcon />
          </IconButton>
          <IconButton 
            color="primary" 
            size="small"
            onClick={() => handleEdit(params.row)}
            title="Chỉnh sửa"
          >
            <EditIcon />
          </IconButton>
          <IconButton 
            color="error" 
            size="small"
            onClick={() => handleDelete(params.row)}
            title="Xóa"
          >
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
        <Button 
          variant="contained" 
          color="secondary" 
          startIcon={<AddIcon />} 
          onClick={handleAdd} 
          sx={{ borderRadius: 2 }}
        >
          Thêm Test
        </Button>
      </Box>

      {/* Tìm kiếm + lọc */}
      <Box display="flex" gap={2} mb={2}>
        <TextField
          label="Tìm kiếm theo tên"
          variant="outlined"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          sx={{ width: "40%" }}
        />
        <Autocomplete
          sx={{ width: "30%" }}
          options={testCategories}
          value={filterCategory}
          onChange={(e, value) => setFilterCategory(value || null)}
          renderInput={params => <TextField {...params} label="Lọc theo danh mục" />}
        />
        {(filterCategory || searchName) && (
          <Button 
            variant="outlined" 
            onClick={() => {
              setFilterCategory(null);
              setSearchName("");
            }}
          >
            Xóa bộ lọc
          </Button>
        )}
      </Box>

      <Box height="70vh">
        <DataGrid 
          rows={filteredTests} 
          columns={columns} 
          getRowId={row => row.id} 
          slots={{ toolbar: GridToolbar }}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 }
            }
          }}
          pageSizeOptions={[5, 10, 25, 50]}
        />
      </Box>

      {/* Dialog thêm/sửa test */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>{isEditMode ? `Chỉnh sửa Test: ${selectedTest?.name || ""}` : "Thêm Test mới"}</DialogTitle>
        <DialogContent>
          <Box mt={1}>
            <TextField
              label="Tên Test"
              fullWidth
              value={selectedTest?.name || ""}
              onChange={(e) => setSelectedTest({ ...selectedTest, name: e.target.value, title: e.target.value })}
              sx={{ mb: 2 }}
            />
            <Autocomplete
              sx={{ mb: 2 }}
              options={testCategories}
              value={selectedTest?.category || ""}
              onChange={(e, value) => setSelectedTest(prev => ({ ...prev, category: value }))}
              renderInput={params => <TextField {...params} label="Danh mục" />}
            />
            
            <Box display="flex" gap={2} mb={2}>
              <TextField
                label="Thời gian (phút)"
                type="number"
                value={selectedTest?.duration || 60}
                onChange={(e) => setSelectedTest({ ...selectedTest, duration: parseInt(e.target.value) || 60 })}
                sx={{ flex: 1 }}
              />
              <TextField
                label="Số câu hỏi"
                type="number"
                value={selectedTest?.totalQuestions || 0}
                onChange={(e) => setSelectedTest({ ...selectedTest, totalQuestions: parseInt(e.target.value) || 0 })}
                sx={{ flex: 1 }}
              />
            </Box>

            <TextField
              label="Cấp độ"
              fullWidth
              value={selectedTest?.level || ""}
              onChange={(e) => setSelectedTest({ ...selectedTest, level: e.target.value })}
              sx={{ mb: 2 }}
              placeholder="e.g., All Levels, Beginner, Intermediate, Advanced"
            />
          </Box>

          <Box mt={2}>
            <Typography variant="subtitle2" mb={1}>File test (tùy chọn)</Typography>
            <TextField
              label="URL File test"
              fullWidth
              value={selectedTest?.questionFileUrl || ""}
              onChange={(e) => setSelectedTest({ ...selectedTest, questionFileUrl: e.target.value })}
            />
            <Typography align="center" mt={1} mb={1}>— hoặc —</Typography>
            <Button 
              variant="outlined" 
              component="label" 
              startIcon={<UploadFileIcon />} 
              sx={{ borderRadius: 2 }}
            >
              Upload file test (.json)
              <input type="file" accept=".js,.json" hidden onChange={handleUploadTestFile} />
            </Button>
            {selectedTest?.uploadedFileName && (
              <Typography mt={1} color="text.secondary">📄 {selectedTest.uploadedFileName}</Typography>
            )}
          </Box>

          <Box mt={2}>
            <Typography variant="subtitle2" mb={1}>Media (tùy chọn)</Typography>
            <TextField
              label="URL Media"
              fullWidth
              value={selectedTest?.mediaUrl || ""}
              onChange={e => setSelectedTest({ ...selectedTest, mediaUrl: e.target.value })}
            />
            <Typography align="center" mt={1} mb={1}>— hoặc —</Typography>
            <Button 
              variant="outlined" 
              component="label" 
              startIcon={<UploadFileIcon />} 
              sx={{ borderRadius: 2 }}
            >
              Upload file media
              <input type="file" accept="audio/*,video/*" hidden onChange={handleUploadMediaFile} />
            </Button>
            {selectedTest?.mediaUrl && (
              <Box mt={2}>
                {selectedTest.mediaUrl.endsWith(".mp4") ? (
                  <video controls width="100%" style={{ borderRadius: 8 }}>
                    <source src={selectedTest.mediaUrl} type="video/mp4" />
                  </video>
                ) : (
                  <audio controls style={{ width: "100%" }}>
                    <source src={selectedTest.mediaUrl} type="audio/mpeg" />
                  </audio>
                )}
              </Box>
            )}
          </Box>

          <TextField
            margin="dense"
            label="Mô tả"
            fullWidth
            multiline
            rows={3}
            sx={{ mt: 3 }}
            value={selectedTest?.description || ""}
            onChange={e => setSelectedTest({ ...selectedTest, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button variant="contained" color="primary" onClick={handleSave}>
            {isEditMode ? "Lưu thay đổi" : "Thêm mới"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog preview test */}
      <Dialog 
        open={openPreview} 
        onClose={() => setOpenPreview(false)} 
        fullWidth 
        maxWidth="lg"
        PaperProps={{
          sx: { height: '90vh' }
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6">
                {isEditingDetails ? "Chỉnh sửa chi tiết test" : "Xem trước test"}
              </Typography>
              {previewTest && (
                <Typography variant="body2" color="text.secondary">
                  {previewTest.name} - {previewTest.category}
                </Typography>
              )}
            </Box>
            {!isEditingDetails && previewQuestions.length > 0 && (
              <Button 
                variant="outlined" 
                onClick={() => setIsEditingDetails(true)}
              >
                Chỉnh sửa
              </Button>
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
                <Typography variant="body2" mt={1} color="text.secondary">
                  {previewTest.description}
                </Typography>
              )}
            </Box>
          )}

          {previewQuestions.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary">
                Không có câu hỏi trong test này
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                Test này chưa có dữ liệu câu hỏi hoặc chưa được upload file test
              </Typography>
            </Box>
          ) : (
            <>
              <Typography variant="subtitle2" mb={2} color="text.secondary">
                Tổng số: {previewQuestions.length} câu hỏi
              </Typography>
              
              {previewQuestions.map((q, index) => (
                <Card key={index} sx={{ mb: 2 }}>
                  <CardContent>
                    {q.sectionTitle && (
                      <Chip 
                        label={q.sectionTitle} 
                        size="small" 
                        color="info" 
                        sx={{ mb: 1 }}
                      />
                    )}
                    
                    {isEditingDetails ? (
                      <>
                        <TextField
                          fullWidth
                          label={`Câu ${q.questionId || index + 1}`}
                          value={q.question}
                          onChange={(e) => handleUpdateQuestion(index, 'question', e.target.value)}
                          sx={{ mb: 2 }}
                          multiline
                        />
                        {q.passage && (
                          <TextField
                            fullWidth
                            label="Đoạn văn"
                            value={q.passage}
                            onChange={(e) => handleUpdateQuestion(index, 'passage', e.target.value)}
                            sx={{ mb: 2 }}
                            multiline
                            rows={3}
                          />
                        )}
                        {q.options?.map((opt, i) => (
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
                        <Typography fontWeight={600} mb={1}>
                          Câu {q.questionId || index + 1}: {q.question}
                        </Typography>
                        
                        {q.passage && (
                          <Box 
                            p={2} 
                            mb={2} 
                            bgcolor="#f9f9f9" 
                            borderRadius={1}
                            border="1px solid #e0e0e0"
                          >
                            <Typography variant="body2">{q.passage}</Typography>
                          </Box>
                        )}
                        
                        {q.audioTimestamp && (
                          <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                            🎧 Audio: {q.audioTimestamp}
                          </Typography>
                        )}
                        
                        {q.options && (
                          <RadioGroup>
                            {q.options.map((opt, i) => (
                              <FormControlLabel
                                key={i}
                                value={i}
                                control={<Radio disabled />}
                                label={
                                  <Typography 
                                    sx={{ 
                                      color: q.correctAnswer === i ? "green" : "inherit", 
                                      fontWeight: q.correctAnswer === i ? 600 : 400 
                                    }}
                                  >
                                    {opt} {q.correctAnswer === i && "✓"}
                                  </Typography>
                                }
                              />
                            ))}
                          </RadioGroup>
                        )}
                        
                        <Box mt={1} display="flex" gap={1} alignItems="center">
                          <Chip 
                            label={`${q.points || 2} điểm`} 
                            size="small" 
                            color="success" 
                            variant="outlined"
                          />
                          <Chip 
                            label={q.type} 
                            size="small" 
                            variant="outlined"
                          />
                        </Box>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </DialogContent>
        
        <DialogActions>
          {isEditingDetails ? (
            <>
              <Button onClick={() => setIsEditingDetails(false)}>Hủy</Button>
              <Button variant="contained" color="primary" onClick={handleSaveTestDetails}>
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