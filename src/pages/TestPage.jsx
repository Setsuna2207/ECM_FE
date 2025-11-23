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

  // Category filter state
  const [selectedCategory, setSelectedCategory] = useState(null);

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
    let tests = [...mockTests];
    
    // Filter by category first
    if (selectedCategory) {
      tests = tests.filter(t => t.category?.toLowerCase() === selectedCategory.toLowerCase());
    }
    
    // Then sort
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
  }, [appliedFilters, selectedCategory]);

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
      {!selectedCategory ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <Typography variant="h4" fontWeight="bold" mb={4}>
            Chọn loại bài test
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 3,
              maxWidth: 600,
              mx: "auto",
            }}
          >
            <Button variant="contained" onClick={() => setSelectedCategory("TOEIC")} sx={{ height: 140 }}>
              TOEIC
            </Button>

            <Button variant="contained" onClick={() => setSelectedCategory("IELTS")} sx={{ height: 140 }}>
              IELTS
            </Button>

            <Button variant="contained" onClick={() => setSelectedCategory("TOEFL")} sx={{ height: 140 }}>
              TOEFL
            </Button>

            <Button variant="contained" onClick={() => setSelectedCategory("GENERAL")} sx={{ height: 140 }}>
              GENERAL
            </Button>
          </Box>
        </Box>
      ) : (
        <>
          {/* Back + Filter */}
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
            <Box display="flex" alignItems="center" gap={2}>
              <Button
                variant="outlined"
                onClick={() => {
                  setSelectedCategory(null);
                  setPage(1);
                }}
              >
                ← Quay lại
              </Button>

              <Typography variant="h5" fontWeight="bold">
                Bài test {selectedCategory}
              </Typography>
            </Box>

            <Button variant="outlined" onClick={handleClick}>
              Bộ lọc
            </Button>
          </Box>

          {/* Filter Menu */}
          <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
            <Paper elevation={0} sx={{ p: 2 }}>
              <FormGroup>
                <Typography fontWeight="bold">Sắp xếp theo:</Typography>
                <Box display="flex" gap={2}>
                  <FormControlLabel
                    control={<Checkbox checked={selectedFilters.duration} name="duration" onChange={handleCheckboxChange} />}
                    label="Thời gian"
                  />
                  <FormControlLabel
                    control={<Checkbox checked={selectedFilters.questions} name="questions" onChange={handleCheckboxChange} />}
                    label="Số câu hỏi"
                  />
                </Box>
              </FormGroup>

              <FormGroup sx={{ mt: 1 }}>
                <Typography fontWeight="bold">Thứ tự:</Typography>
                <Box display="flex" gap={2}>
                  <FormControlLabel
                    control={<Checkbox checked={selectedFilters.asc} name="asc" onChange={handleCheckboxChange} />}
                    label="Tăng dần"
                  />
                  <FormControlLabel
                    control={<Checkbox checked={selectedFilters.desc} name="desc" onChange={handleCheckboxChange} />}
                    label="Giảm dần"
                  />
                </Box>
              </FormGroup>

              <Divider sx={{ my: 2 }} />

              <Box display="flex" justifyContent="space-between">
                <Button onClick={handleReset}>Mặc định</Button>
                <Button onClick={handleApply}>Áp dụng</Button>
              </Box>
            </Paper>
          </Menu>

          {/* LIST TEST */}
          {paginatedTests.length > 0 ? (
            <>
              <Grid container spacing={3}>
                {paginatedTests.map((test) => (
                  <Grid key={test.testId} item xs={12} sm={6} md={4}>
                    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" fontWeight="bold">
                          {test.title}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          {test.description}
                        </Typography>

                        <Box display="flex" gap={1} mt={2}>
                          <Chip icon={<AccessTimeIcon />} label={`${test.duration} phút`} size="small" />
                          <Chip icon={<QuizIcon />} label={`${test.totalQuestions} câu`} size="small" />
                        </Box>

                        {test.level && (
                          <Chip label={test.level} size="small" sx={{ mt: 1 }} />
                        )}
                      </CardContent>

                      <CardActions sx={{ p: 2 }}>
                        <Button fullWidth variant="contained" onClick={() => handleStartTest(test.testId)}>
                          Bắt đầu làm bài
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {pageCount > 1 && (
                <Stack alignItems="center" mt={4}>
                  <Pagination count={pageCount} page={page} onChange={handlePageChange} color="primary" />
                </Stack>
              )}
            </>
          ) : (
            <Typography mt={2} color="text.secondary">
              Không tìm thấy bài test nào.
            </Typography>
          )}
        </>
      )}
    </Container>

    <Footer />
  </>
);

}