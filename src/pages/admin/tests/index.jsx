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
  CircularProgress,
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
import {
  GetAllPlacementTests,
  GetPlacementTestById,
  CreatePlacementTest,
  UpdatePlacementTest,
  DeletePlacementTest,
  UploadTestFile,
  UploadTestMedia,
} from "../../../services/placementTestService";

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
  const [loading, setLoading] = useState(false);
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

  // Fetch tests from backend
  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const response = await GetAllPlacementTests();
      const testsData = Array.isArray(response.data) ? response.data : [];
      console.log("Raw tests from backend:", testsData);

      const formatted = testsData.map((t, idx) => {
        console.log(`Processing test ${idx}:`, t.title || t.Title);

        // Parse sections - check both lowercase and uppercase
        let sections = null;
        let uploadedTestData = null;

        const sectionsData = t.sections || t.Sections;

        console.log("  - sectionsData type:", typeof sectionsData);
        console.log("  - sectionsData isArray:", Array.isArray(sectionsData));
        console.log("  - sectionsData sample:", sectionsData);

        if (sectionsData) {
          if (typeof sectionsData === 'string') {
            try {
              sections = JSON.parse(sectionsData);
              uploadedTestData = { sections };
              console.log("  ✅ Parsed sections from string:", sections.length);
            } catch (e) {
              console.error("  ❌ Error parsing sections string:", e);
            }
          } else if (Array.isArray(sectionsData)) {
            sections = sectionsData;
            uploadedTestData = { sections };
            console.log("  ✅ Using sections array:", sections.length, "sections");
          } else if (typeof sectionsData === 'object') {
            sections = sectionsData;
            uploadedTestData = { sections };
            console.log("  ✅ Using sections object");
          }
        } else {
          console.log("  ⚠️ No sections data found");
        }

        // Calculate total questions from sections
        let totalQuestionsCalc = 0;
        if (sections && Array.isArray(sections)) {
          sections.forEach(section => {
            if (section.questions && Array.isArray(section.questions)) {
              totalQuestionsCalc += section.questions.length;
            }
          });
        }

        return {
          ...t,
          id: t.testID || t.TestID || t.testId || idx + 1,
          testId: t.testID || t.TestID || t.testId,
          name: t.title || t.Title || "",
          title: t.title || t.Title || "",
          description: t.description || t.Description || "",
          category: t.category || t.Category || "GENERAL",
          duration: t.duration || t.Duration || 85,
          totalQuestions: totalQuestionsCalc || t.totalQuestions || t.TotalQuestions || 0,
          level: t.level || t.Level || "All Levels",
          questionFileUrl: t.questionFileURL || t.QuestionFileURL || "",
          mediaUrl: t.mediaURL || t.MediaURL || "",
          sections: sections,
          uploadedTestData: uploadedTestData,
        };
      });
      setTests(formatted);
    } catch (error) {
      console.error("Error fetching tests:", error);
      alert("Không thể tải danh sách test. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

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
      setLoading(true);
      const text = await file.text();
      let testData = null;

      if (file.name.endsWith('.json')) {
        testData = JSON.parse(text);
      } else {
        throw new Error("File must be .json format");
      }

      if (!testData || !testData.sections) {
        throw new Error("No test data or sections found in file");
      }

      // Store the parsed data in memory for preview
      const updatedTest = {
        ...selectedTest,
        uploadedFileName: file.name,
        uploadedTestData: testData,
        uploadedFile: file, // Store the actual file for later upload
      };

      setSelectedTest(updatedTest);

      alert(`✅ Tải file thành công! (${testData.sections?.length || 0} sections)`);

      // Auto-open preview
      setTimeout(() => {
        handlePreview(updatedTest);
      }, 500);
    } catch (error) {
      console.error("Error reading test file:", error);
      alert(`❌ Lỗi tải file: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadMediaFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);

      // Store the file for later upload to backend
      setSelectedTest((prev) => ({
        ...prev,
        uploadedMediaFile: file,
        uploadedMediaName: file.name,
        mediaUrl: URL.createObjectURL(file), // For preview only
      }));

      alert(`✅ Tải media thành công!`);
    } catch (error) {
      console.error("Error uploading media:", error);
      alert(`❌ Lỗi tải media: ${error.message}`);
    } finally {
      setLoading(false);
    }
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

  const handleDelete = async (row) => {
    if (!window.confirm("Bạn có chắc muốn xóa test này không?")) return;

    try {
      setLoading(true);
      const testId = row.testId || row.id;
      await DeletePlacementTest(testId);
      alert("Xóa thành công!");
      await fetchTests();
    } catch (error) {
      console.error("Error deleting test:", error);
      alert("Không thể xóa test. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedTest.category || !selectedTest.title) {
      alert("Nhập tiêu đề và chọn danh mục!");
      return;
    }

    if (!selectedTest.uploadedFile && !isEditMode) {
      alert("Vui lòng upload file test!");
      return;
    }

    try {
      setLoading(true);

      // Use the upload endpoint which handles both create and update
      const file = selectedTest.uploadedFile;
      const testId = isEditMode && selectedTest.testId ? selectedTest.testId : null;

      const uploadRes = await UploadTestFile(
        file,
        selectedTest.title,
        selectedTest.description || "",
        testId
      );

      if (uploadRes.data.success) {
        const createdTestId = uploadRes.data.data?.testId || uploadRes.data.testId;

        // If media file was uploaded, upload it separately
        if (selectedTest.uploadedMediaFile && createdTestId) {
          try {
            await UploadTestMedia(createdTestId, selectedTest.uploadedMediaFile);
          } catch (mediaError) {
            console.error("Error uploading media:", mediaError);
            alert("Test đã lưu nhưng không thể upload media. Vui lòng thử lại sau.");
          }
        }

        alert(isEditMode ? "Cập nhật thành công!" : "Thêm test thành công!");
        setOpenDialog(false);
        await fetchTests();
      } else {
        alert(`Lỗi: ${uploadRes.data.message}`);
      }
    } catch (error) {
      console.error("Error saving test:", error);
      const errorMsg = error.response?.data?.message || error.message;
      alert(`Không thể lưu test: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async (test) => {
    setPreviewTest(test);
    setPreviewQuestions([]);
    setPreviewSections([]);
    setPreviewMedia(null);
    setIsEditingDetails(false);
    setOpenPreview(true);

    try {
      setLoading(true);
      let testData = null;
      let mediaUrl = null;

      // Try to get test data from uploaded data first
      if (test.uploadedTestData) {
        testData = test.uploadedTestData;
      }
      // Try to get from sections stored in backend
      else if (test.sections) {
        // Handle if sections is still a string
        if (typeof test.sections === 'string') {
          try {
            const parsed = JSON.parse(test.sections);
            testData = { sections: parsed };
          } catch (e) {
            console.error("Failed to parse sections string:", e);
          }
        } else if (Array.isArray(test.sections)) {
          testData = { sections: test.sections };
        } else {
          testData = { sections: test.sections };
        }
      }
      // Fetch from backend by ID
      else if (test.testId) {
        try {
          const response = await GetPlacementTestById(test.testId);
          const backendTest = response.data;

          if (backendTest.sections || backendTest.Sections) {
            const sectionsData = backendTest.sections || backendTest.Sections;
            if (typeof sectionsData === 'string') {
              testData = { sections: JSON.parse(sectionsData) };
            } else {
              testData = { sections: sectionsData };
            }
          }

          // Get media URL from backend
          if (backendTest.mediaURL || backendTest.MediaURL) {
            const backendMediaUrl = backendTest.mediaURL || backendTest.MediaURL;
            if (backendMediaUrl.startsWith('http')) {
              mediaUrl = backendMediaUrl;
            } else {
              const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'https://localhost:7264';
              mediaUrl = backendMediaUrl.startsWith('/')
                ? `${baseUrl}${backendMediaUrl}`
                : `${baseUrl}/${backendMediaUrl}`;
            }
          }
        } catch (e) {
          console.error("Error fetching test from backend:", e);
        }
      }

      // Get media URL
      if (!mediaUrl && test.mediaUrl) {
        if (test.mediaUrl.startsWith('blob:')) {
          // Local preview URL
          mediaUrl = test.mediaUrl;
        } else if (test.mediaUrl.startsWith('http')) {
          mediaUrl = test.mediaUrl;
        } else {
          // Backend URL - ensure proper path construction
          const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'https://localhost:7264';
          mediaUrl = test.mediaUrl.startsWith('/')
            ? `${baseUrl}${test.mediaUrl}`
            : `${baseUrl}/${test.mediaUrl}`;
        }
      }

      console.log("Preview media URL:", mediaUrl);
      setPreviewMedia(mediaUrl);

      if (testData) {
        if (testData.sections && Array.isArray(testData.sections)) {
          setPreviewSections(testData.sections);
          const allQuestions = [];
          testData.sections.forEach(section => {
            const questions = section.questions || section.Questions || [];
            questions.forEach(q => {
              allQuestions.push({
                ...q,
                sectionTitle: section.title || section.Title,
                sectionId: section.sectionId || section.SectionId
              });
            });
          });
          setPreviewQuestions(allQuestions);
        } else if (testData.questions && Array.isArray(testData.questions)) {
          setPreviewQuestions(testData.questions);
        }
      }
    } catch (error) {
      console.error("Error loading test:", error);
      alert("Không thể tải câu hỏi test.");
    } finally {
      setLoading(false);
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

  const handleSaveTestDetails = async () => {
    try {
      setLoading(true);

      // Reconstruct sections with updated questions
      const updatedSections = previewSections.map(section => ({
        ...section,
        questions: previewQuestions.filter(q =>
          (q.sectionId || q.SectionId) === (section.sectionId || section.SectionId)
        )
      }));

      const updatedTestData = { sections: updatedSections };

      // Create a file from the updated test data
      const testDataJson = JSON.stringify(updatedTestData);
      const blob = new Blob([testDataJson], { type: 'application/json' });
      const file = new File([blob], `${previewTest.title}.json`, { type: 'application/json' });

      const uploadRes = await UploadTestFile(
        file,
        previewTest.title,
        previewTest.description || "",
        previewTest.testId
      );

      if (uploadRes.data.success) {
        alert("Đã lưu thay đổi chi tiết test!");
        setIsEditingDetails(false);
        await fetchTests();
        setOpenPreview(false);
      } else {
        alert(`Lỗi: ${uploadRes.data.message}`);
      }
    } catch (error) {
      console.error("Error saving test details:", error);
      const errorMsg = error.response?.data?.message || error.message;
      alert(`Không thể lưu: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
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
        <Header title="Quản lý Test" subtitle="Danh sách bài kiểm tra. Lưu ý:
        Chuyển đổi định dạng file trước khi upload." />
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
        <DialogTitle>{isEditMode ? "Chỉnh sửa Test" : "Thêm Test mới"}</DialogTitle>
        <DialogContent>
          <Box mt={2} display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Tiêu đề"
              fullWidth
              value={selectedTest?.title || ""}
              onChange={(e) => setSelectedTest(prev => ({ ...prev, title: e.target.value }))}
            />

            <Autocomplete
              options={["TOEIC", "TOEFL", "IELTS", "GENERAL"]}
              value={selectedTest?.category || "GENERAL"}
              onChange={(e, val) => setSelectedTest(prev => ({ ...prev, category: val || "GENERAL" }))}
              renderInput={(params) => <TextField {...params} label="Danh mục" />}
            />

            <TextField
              label="Mô tả"
              fullWidth
              multiline
              rows={3}
              value={selectedTest?.description || ""}
              onChange={(e) => setSelectedTest(prev => ({ ...prev, description: e.target.value }))}
            />

            <TextField
              label="Thời gian (phút)"
              type="number"
              fullWidth
              value={selectedTest?.duration || 60}
              onChange={(e) => setSelectedTest(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
            />

            <TextField
              label="Cấp độ"
              fullWidth
              value={selectedTest?.level || "All Levels"}
              onChange={(e) => setSelectedTest(prev => ({ ...prev, level: e.target.value }))}
            />

            <Box>
              <Button variant="outlined" component="label" startIcon={<UploadFileIcon />} fullWidth>
                Upload file test (.json)
                <input type="file" accept=".json" hidden onChange={handleUploadTestFile} disabled={loading} />
              </Button>
              {selectedTest?.uploadedFileName && (
                <Typography mt={1} color="success.main" fontWeight="500">
                  ✅ {selectedTest.uploadedFileName}
                </Typography>
              )}
            </Box>

            <Box>
              <Button variant="outlined" component="label" startIcon={<UploadFileIcon />} fullWidth>
                Upload media
                <input type="file" accept="audio/*,video/*" hidden onChange={handleUploadMediaFile} disabled={loading} />
              </Button>
              {selectedTest?.uploadedMediaName && (
                <Typography mt={1} color="success.main" fontWeight="500">
                  ✅ {selectedTest.uploadedMediaName}
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSave} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : (isEditMode ? "Cập nhật" : "Thêm")}
          </Button>
        </DialogActions>
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
                <video
                  controls
                  style={{ width: "100%", maxHeight: "400px", borderRadius: 8 }}
                  onError={(e) => {
                    console.error("Video load error:", e);
                    console.error("Video src:", previewMedia);
                  }}
                >
                  <source src={previewMedia} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <audio
                  controls
                  style={{ width: "100%" }}
                  onError={(e) => {
                    console.error("Audio load error:", e);
                    console.error("Audio src:", previewMedia);
                  }}
                >
                  <source src={previewMedia} type="audio/mpeg" />
                  <source src={previewMedia} type="audio/mp3" />
                  Your browser does not support the audio tag.
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