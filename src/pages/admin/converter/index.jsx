import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
  Paper,
  Chip,
  Tooltip,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DescriptionIcon from "@mui/icons-material/Description";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import { ConvertDocxToJson, ConvertPdfToJson } from "../../../services/fileConversionService";
import Header from "../../../components/Header";

export default function FileConverter() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState("quiz");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const extension = file.name.split('.').pop().toLowerCase();
      if (extension !== 'docx' && extension !== 'pdf') {
        setError("Chỉ hỗ trợ file .docx và .pdf");
        return;
      }

      setSelectedFile(file);
      setError("");
      setResult(null);
    }
  };

  const handleConvert = async () => {
    if (!selectedFile) {
      setError("Vui lòng chọn file để chuyển đổi");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const extension = selectedFile.name.split('.').pop().toLowerCase();
      let response;

      console.log("🔄 Converting file:", selectedFile.name);
      console.log("🔄 File type:", fileType);
      console.log("🔄 Extension:", extension);

      if (extension === 'docx') {
        response = await ConvertDocxToJson(selectedFile, fileType);
      } else if (extension === 'pdf') {
        response = await ConvertPdfToJson(selectedFile, fileType);
      }

      console.log("📊 Full response:", response);
      console.log("📊 Response data:", response.data);

      const responseData = response.data;

      if (responseData.success === true || response.status === 200) {
        console.log("✅ Chuyển đổi thành công!");
        // Store the actual data object which contains jsonString
        setResult(responseData);
        setError("");
      } else {
        console.log("❌ Conversion failed:", responseData.message);
        setError(responseData.message || "Lỗi khi chuyển đổi file");
      }
    } catch (err) {
      console.error("❌ Conversion error:", err);
      console.error("❌ Error response:", err.response);
      console.error("❌ Error data:", err.response?.data);

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data) {
        setError(typeof err.response.data === 'string'
          ? err.response.data
          : JSON.stringify(err.response.data));
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Lỗi không xác định khi chuyển đổi file");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyJson = () => {
    // Try multiple possible locations for the JSON string
    const jsonString = result?.jsonString ||
      result?.data?.jsonString ||
      (result?.data && JSON.stringify(result.data, null, 2)) ||
      JSON.stringify(result, null, 2);

    if (jsonString) {
      console.log("📋 Copying JSON to clipboard");
      navigator.clipboard.writeText(jsonString);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } else {
      console.error("❌ No JSON string found in result:", result);
      setError("Không thể sao chép JSON");
    }
  };

  const handleDownloadJson = () => {
    // Try multiple possible locations for the JSON string
    const jsonString = result?.jsonString ||
      result?.data?.jsonString ||
      (result?.data && JSON.stringify(result.data, null, 2)) ||
      JSON.stringify(result, null, 2);

    if (jsonString) {
      console.log("📥 Downloading JSON file");
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `converted_${fileType}_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      console.error("❌ No JSON string found in result:", result);
      setError("Không thể tải xuống JSON");
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    setError("");
    setCopySuccess(false);
  };

  const getFileIcon = () => {
    if (!selectedFile) return null;
    const extension = selectedFile.name.split('.').pop().toLowerCase();
    return extension === 'pdf' ? (
      <PictureAsPdfIcon sx={{ fontSize: 48, color: "#f44336" }} />
    ) : (
      <DescriptionIcon sx={{ fontSize: 48, color: "#2196f3" }} />
    );
  };

  return (
    <Box p={3}>
      <Header
        title="Chuyển đổi File sang JSON"
        subtitle="Chuyển đổi file DOCX/PDF thành định dạng JSON cho Quiz và Test"
      />

      <Box sx={{ maxWidth: 1200, mx: "auto", mt: 3 }}>
        {/* Upload Section */}
        <Card sx={{ mb: 3, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Tải lên file
            </Typography>

            <Box display="flex" gap={2} mb={3} flexDirection={{ xs: "column", md: "row" }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Loại file</InputLabel>
                <Select
                  value={fileType}
                  label="Loại file"
                  onChange={(e) => setFileType(e.target.value)}
                  disabled={loading}
                >
                  <MenuItem value="quiz">Quiz</MenuItem>
                  <MenuItem value="test">Test</MenuItem>
                </Select>
              </FormControl>

              <Button
                component="label"
                variant="contained"
                startIcon={<CloudUploadIcon />}
                disabled={loading}
                sx={{
                  textTransform: "none",
                  fontWeight: "bold",
                  borderRadius: 2,
                  minWidth: 200,
                }}
              >
                Chọn file
                <input
                  type="file"
                  hidden
                  accept=".docx,.pdf"
                  onChange={handleFileChange}
                />
              </Button>

              {selectedFile && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleReset}
                  disabled={loading}
                  sx={{ textTransform: "none", borderRadius: 2 }}
                >
                  Xóa
                </Button>
              )}
            </Box>

            {selectedFile && (
              <Paper
                sx={{
                  p: 2,
                  backgroundColor: "#f5f5f5",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                {getFileIcon()}
                <Box flex={1}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {selectedFile.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </Typography>
                </Box>
                <Chip
                  label={fileType.toUpperCase()}
                  color="primary"
                  size="small"
                />
              </Paper>
            )}

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <Box mt={3}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                onClick={handleConvert}
                disabled={!selectedFile || loading}
                sx={{
                  textTransform: "none",
                  fontWeight: "bold",
                  borderRadius: 2,
                  py: 1.5,
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                    Đang chuyển đổi...
                  </>
                ) : (
                  "Chuyển đổi sang JSON"
                )}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Result Section */}
        {result && (
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <CheckCircleIcon sx={{ color: "#4caf50" }} />
                <Typography variant="h6" fontWeight="bold">
                  Kết quả chuyển đổi
                </Typography>
              </Box>

              <Alert severity="success" sx={{ mb: 2 }}>
                {result.message || "Chuyển đổi thành công!"}
              </Alert>

              {/* Summary */}
              <Paper sx={{ p: 2, mb: 2, backgroundColor: "#f9fafb" }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Thông tin tóm tắt
                </Typography>
                <Box display="flex" gap={3} flexWrap="wrap">
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Tổng số câu hỏi
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {result.data?.totalQuestions || 0}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Số phần
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {result.data?.sections?.length || 0}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Thời gian
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {result.data?.duration || 0} phút
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              <Divider sx={{ my: 2 }} />

              {/* Actions */}
              <Box display="flex" gap={2} mb={2}>
                <Tooltip title={copySuccess ? "Đã sao chép!" : "Sao chép JSON"}>
                  <Button
                    variant="outlined"
                    startIcon={<ContentCopyIcon />}
                    onClick={handleCopyJson}
                    sx={{ textTransform: "none", borderRadius: 2 }}
                  >
                    {copySuccess ? "Đã sao chép" : "Sao chép JSON"}
                  </Button>
                </Tooltip>

                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadJson}
                  sx={{ textTransform: "none", borderRadius: 2 }}
                >
                  Tải xuống JSON
                </Button>
              </Box>

              {/* JSON Preview */}
              <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                Xem trước JSON
              </Typography>
              <Paper
                sx={{
                  p: 2,
                  backgroundColor: "#1e1e1e",
                  color: "#d4d4d4",
                  borderRadius: 2,
                  maxHeight: 400,
                  overflow: "auto",
                  fontFamily: "monospace",
                  fontSize: "0.85rem",
                }}
              >
                <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                  {result?.jsonString || result?.data?.jsonString || (result?.data && JSON.stringify(result.data, null, 2)) || JSON.stringify(result, null, 2) || "No JSON data available"}
                </pre>
              </Paper>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card sx={{ mt: 3, borderRadius: 3, backgroundColor: "#e3f2fd" }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              📋 Hướng dẫn định dạng file
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Định dạng câu hỏi:</strong>
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <Typography component="li" variant="body2">
                Câu hỏi: "Question 1:", "Q1:", hoặc "1."
              </Typography>
              <Typography component="li" variant="body2">
                Đáp án: "A.", "B.", "C.", "D." hoặc "a.", "b.", "c.", "d."
              </Typography>
              <Typography component="li" variant="body2">
                Đáp án đúng: "Answer: B" hoặc "Correct: B"
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Định dạng phần (cho Test):</strong>
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <Typography component="li" variant="body2">
                "Section 1:", "Part 1:", hoặc chữ in hoa như "LISTENING COMPREHENSION"
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}