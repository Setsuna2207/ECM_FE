import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Grid,
  Typography,
  Button,
  Menu,
  Box,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider,
  Paper,
  Pagination,
  Stack,
  Card,
  CardContent,
  CardActions,
  Chip,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import QuizIcon from "@mui/icons-material/Quiz";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { mockTests } from "../data/mockTest";

export default function TestPage() {
  const navigate = useNavigate();

  // Filter state
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({
    duration: true,
    questions: false,
    asc: false,
    desc: true,
  });
  const [appliedFilters, setAppliedFilters] = useState({
    duration: true,
    questions: false,
    asc: false,
    desc: true,
  });

  // Pagination
  const [page, setPage] = useState(1);
  const testsPerPage = 6;

  const open = Boolean(anchorEl);
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    if (name === "duration" || name === "questions") {
      setSelectedFilters((prev) => ({
        ...prev,
        duration: name === "duration" ? checked : false,
        questions: name === "questions" ? checked : false,
      }));
    } else if (name === "asc" || name === "desc") {
      setSelectedFilters((prev) => ({
        ...prev,
        asc: name === "asc" ? checked : false,
        desc: name === "desc" ? checked : false,
      }));
    }
  };

  const handleApply = () => {
    setAppliedFilters(selectedFilters);
    setPage(1);
    setAnchorEl(null);
  };

  const handleReset = () => {
    const defaultFilters = {
      duration: true,
      questions: false,
      asc: false,
      desc: true,
    };
    setSelectedFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setPage(1);
    setAnchorEl(null);
  };

  // Sort tests
  const sortedTests = useMemo(() => {
    const tests = [...mockTests];
    return tests.sort((a, b) => {
      if (appliedFilters.duration) {
        return appliedFilters.asc
          ? a.duration - b.duration
          : b.duration - a.duration;
      } else if (appliedFilters.questions) {
        return appliedFilters.asc
          ? a.totalQuestions - b.totalQuestions
          : b.totalQuestions - a.totalQuestions;
      }
      return 0;
    });
  }, [appliedFilters]);

  // Pagination
  const pageCount = Math.ceil(sortedTests.length / testsPerPage);
  const paginatedTests = sortedTests.slice(
    (page - 1) * testsPerPage,
    page * testsPerPage
  );

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStartTest = (testId) => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user) {
      alert("Bạn cần đăng nhập để làm bài test.");
      return;
    }
    navigate(`/test/${testId}`);
  };

  return (
    <>
      <Navbar />
      
      {/* Header Section */}
      <Box sx={{ backgroundColor: "#111", color: "white", py: 6 }}>
        <Container>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Bài kiểm tra trình độ
          </Typography>
          <Typography variant="body1" color="#ddd">
            Làm bài test để xác định trình độ tiếng Anh của bạn và nhận được khuyến nghị khóa học phù hợp
          </Typography>
        </Container>
      </Box>

      <Container sx={{ mt: 4, mb: 4 }}>
        {/* Filter button */}
        <Box display="flex" alignItems="center" gap={4} mb={3}>
          <Typography variant="h5" fontWeight="bold">
            Danh sách bài test
          </Typography>

          <Button
            variant="outlined"
            onClick={handleClick}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              borderColor: "#4038d2ff",
              color: "#4038d2ff",
              fontWeight: 600,
              "&:hover": {
                backgroundColor: "#f3f1ff",
                borderColor: "#73169aff",
              },
            }}
          >
            Bộ lọc
          </Button>
        </Box>

        {/* Filter Menu */}
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          PaperProps={{
            elevation: 3,
            sx: {
              borderRadius: 2,
              minWidth: 280,
              backgroundColor: "#fff",
              border: "1px solid #e0e0e0",
              p: 1,
            },
          }}
        >
          <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2 }}>
            <FormGroup>
              <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.5 }}>
                Sắp xếp theo:
              </Typography>
              <Box display="flex" gap={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={selectedFilters.duration}
                      onChange={handleCheckboxChange}
                      name="duration"
                      sx={{
                        color: "#6C63FF",
                        "&.Mui-checked": { color: "#6C63FF" },
                      }}
                    />
                  }
                  label="Thời gian"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={selectedFilters.questions}
                      onChange={handleCheckboxChange}
                      name="questions"
                      sx={{
                        color: "#6C63FF",
                        "&.Mui-checked": { color: "#6C63FF" },
                      }}
                    />
                  }
                  label="Số câu hỏi"
                />
              </Box>
            </FormGroup>

            <FormGroup sx={{ mt: 1 }}>
              <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.5 }}>
                Thứ tự:
              </Typography>
              <Box display="flex" gap={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={selectedFilters.asc}
                      onChange={handleCheckboxChange}
                      name="asc"
                      sx={{
                        color: "#6C63FF",
                        "&.Mui-checked": { color: "#6C63FF" },
                      }}
                    />
                  }
                  label="Tăng dần"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={selectedFilters.desc}
                      onChange={handleCheckboxChange}
                      name="desc"
                      sx={{
                        color: "#6C63FF",
                        "&.Mui-checked": { color: "#6C63FF" },
                      }}
                    />
                  }
                  label="Giảm dần"
                />
              </Box>
            </FormGroup>

            <Divider sx={{ my: 1 }} />

            <Box display="flex" justifyContent="space-between">
              <Button
                onClick={handleReset}
                sx={{
                  color: "#777",
                  textTransform: "none",
                  fontSize: "0.85rem",
                  fontWeight: "bold",
                }}
              >
                Mặc định
              </Button>
              <Button
                onClick={handleApply}
                sx={{
                  textTransform: "none",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  backgroundColor: "#4038d2ff",
                  color: "#fff",
                  borderRadius: 2,
                  px: 2,
                  py: 0.5,
                  "&:hover": { backgroundColor: "#73169aff" },
                }}
              >
                Áp dụng
              </Button>
            </Box>
          </Paper>
        </Menu>

        {/* Test Cards */}
        {paginatedTests.length > 0 ? (
          <>
            <Grid container spacing={3}>
              {paginatedTests.map((test) => (
                <Grid item key={test.testId} xs={12} sm={6} md={4}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: 2,
                      boxShadow: 2,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: 6,
                      },
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {test.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mb={2}>
                        {test.description}
                      </Typography>

                      <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                        <Chip
                          icon={<AccessTimeIcon />}
                          label={`${test.duration} phút`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        <Chip
                          icon={<QuizIcon />}
                          label={`${test.totalQuestions} câu`}
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                      </Box>

                      {test.level && (
                        <Chip
                          label={test.level}
                          size="small"
                          sx={{
                            backgroundColor: "#f5f5f5",
                            fontWeight: 600,
                          }}
                        />
                      )}
                    </CardContent>

                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => handleStartTest(test.testId)}
                        sx={{
                          backgroundColor: "#4038d2ff",
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: 600,
                          py: 1,
                          "&:hover": {
                            backgroundColor: "#73169aff",
                          },
                        }}
                      >
                        Bắt đầu làm bài
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            {pageCount > 1 && (
              <Stack alignItems="center" mt={4}>
                <Pagination
                  count={pageCount}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  shape="rounded"
                  size="large"
                  showFirstButton
                  showLastButton
                  sx={{
                    "& .MuiPaginationItem-root": {
                      fontWeight: "bold",
                      color: "#6C63FF",
                    },
                    "& .Mui-selected": {
                      backgroundColor: "#6C63FF !important",
                      color: "#fff",
                    },
                  }}
                />
              </Stack>
            )}
          </>
        ) : (
          <Typography variant="body1" color="text.secondary" mt={2}>
            Không tìm thấy bài test nào.
          </Typography>
        )}
      </Container>

      <Footer />
    </>
  );
}