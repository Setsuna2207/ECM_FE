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
  Autocomplete
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import Header from "../../../components/Header";
import { mockTests } from "../../../data/mockTest";
import { getTestById } from "../../../data/test/testRegistry";

const testCategories = ["TOEIC", "TOEFL", "IELTS", "General"];

export default function ManageTest() {
  const [tests, setTests] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);

  const [filterCategory, setFilterCategory] = useState(null);
  const [searchName, setSearchName] = useState("");

  const [openPreview, setOpenPreview] = useState(false);
  const [previewQuestions, setPreviewQuestions] = useState([]);
  const [previewMedia, setPreviewMedia] = useState(null);
  const [isEditingDetails, setIsEditingDetails] = useState(false);

  useEffect(() => {
    const formatted = mockTests.map((t, idx) => ({
      ...t,
      id: t.testId || idx + 1,
      description: t.description || "",
      mediaUrl: t.mediaUrl || "",
      category: t.category || "General",
    }));
    setTests(formatted);
  }, []);

  const filteredTests = tests.filter(t => {
    const matchCategory = filterCategory ? t.category === filterCategory : true;
    const matchName = searchName ? t.name?.toLowerCase().includes(searchName.toLowerCase()) : true;
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
    setSelectedTest({ name: "", category: "", questionFileUrl: "", mediaUrl: "", description: "" });
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
    if (!selectedTest.category || !selectedTest.questionFileUrl || !selectedTest.name) {
      alert("Nhập tiêu đề, chọn danh mục và upload file test!");
      return;
    }
    const updated = isEditMode
      ? tests.map(t => t.id === selectedTest.id ? selectedTest : t)
      : [{ ...selectedTest, id: tests.length + 1, testId: tests.length + 1 }, ...tests];
    setTests(updated);
    alert(isEditMode ? "Cập nhật thành công!" : "Đã thêm test mới!");
    setOpenDialog(false);
  };

  const handlePreview = async (test) => {
    setPreviewQuestions([]);
    setPreviewMedia(test.mediaUrl || null);
    setIsEditingDetails(false);
    setOpenPreview(true);
    try {
      let questionsData = null;
      if (test.uploadedTestData) questionsData = test.uploadedTestData.questions;
      else if (test.testId) {
        const testData = getTestById(test.testId);
        if (testData && testData.questions) questionsData = testData.questions;
      }
      if (questionsData && Array.isArray(questionsData)) setPreviewQuestions(questionsData);
    } catch (error) {
      console.error(error);
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
    setOpenPreview(false);
  };

  const columns = [
    { field: "id", headerName: "TestID", flex: 0.5 },
    { field: "name", headerName: "Tiêu đề", flex: 0.7 },
    { field: "category", headerName: "Danh mục", flex: 0.2 },
    {
      field: "questionFileUrl",
      headerName: "File câu hỏi",
      flex: 0.5,
      renderCell: params => (
        <Button color="secondary" startIcon={<VisibilityIcon />} onClick={() => handlePreview(params.row)}>
          Xem test
        </Button>
      )
    },
    {
      field: "mediaUrl",
      headerName: "Media",
      flex: 0.2 ,
      renderCell: params => params.value ? <VideoLibraryIcon /> : <Typography color="text.secondary">Không có</Typography>
    },
    {
      field: "actions",
      headerName: "Hành động",
      flex: 0.2,
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
        <Header title="Quản lý Test" subtitle="Danh sách bài kiểm tra" />
        <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={handleAdd} sx={{ borderRadius: 2 }}>Thêm Test</Button>
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
      </Box>

      <Box height="70vh">
        <DataGrid rows={filteredTests} columns={columns} getRowId={row => row.id} slots={{ toolbar: GridToolbar }} />
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
              onChange={(e) => setSelectedTest({ ...selectedTest, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <Autocomplete
              sx={{ width: "100%" }}
              options={testCategories}
              value={selectedTest?.category || ""}
              onChange={(e, value) => setSelectedTest(prev => ({ ...prev, category: value }))}
              renderInput={params => <TextField {...params} label="Danh mục" />}
            />
          </Box>

          <Box mt={2}>
            <TextField
              label="URL File test"
              fullWidth
              value={selectedTest?.questionFileUrl || ""}
              onChange={(e) => setSelectedTest({ ...selectedTest, questionFileUrl: e.target.value })}
            />
            <Typography align="center" mt={1} mb={1}>— hoặc —</Typography>
            <Button variant="outlined" component="label" startIcon={<UploadFileIcon />} sx={{ borderRadius: 2 }}>
              Upload file test (.json)
              <input type="file" accept=".js,.json" hidden onChange={handleUploadTestFile} />
            </Button>
            {selectedTest?.uploadedFileName && <Typography mt={1} color="text.secondary">📄 {selectedTest.uploadedFileName}</Typography>}
          </Box>

          <Box mt={2}>
            <TextField
              label="URL Media"
              fullWidth
              value={selectedTest?.mediaUrl || ""}
              onChange={e => setSelectedTest({ ...selectedTest, mediaUrl: e.target.value })}
            />
            <Typography align="center" mt={1} mb={1}>— hoặc —</Typography>
            <Button variant="outlined" component="label" startIcon={<UploadFileIcon />} sx={{ borderRadius: 2 }}>
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
            rows={2}
            sx={{ mt: 3 }}
            value={selectedTest?.description || ""}
            onChange={e => setSelectedTest({ ...selectedTest, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button variant="contained" color="primary" onClick={handleSave}>{isEditMode ? "Lưu thay đổi" : "Thêm mới"}</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog preview test */}
      <Dialog open={openPreview} onClose={() => setOpenPreview(false)} fullWidth maxWidth="md">
        <DialogTitle>{isEditingDetails ? "Chỉnh sửa chi tiết test" : "Xem trước test"}</DialogTitle>
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
          {previewQuestions.length === 0 ? (
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
                      <Typography fontWeight={600}>Câu {index + 1}: {q.question}</Typography>
                      <RadioGroup>
                        {q.options?.map((opt, i) => (
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
              <Button onClick={() => setOpenPreview(false)}>Hủy</Button>
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
