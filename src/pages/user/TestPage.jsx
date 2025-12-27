// src/pages/TestPage.jsx
import React, { useState, useMemo, useEffect } from "react";
import { Container, Typography, Box, Button, Grid, Stack, Pagination, CircularProgress, Alert } from "@mui/material";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import TestCard from "../../components/TestCard";
import { GetAllPlacementTests } from "../../services/placementTestService";

export default function TestPage() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [page, setPage] = useState(1);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const testsPerPage = 15;

  // Fetch tests from backend
  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await GetAllPlacementTests();

        // Handle both uppercase and lowercase property names
        const testsData = response.data || response.Data || [];

        // Transform backend data to match expected format
        const transformedTests = testsData.map(test => ({
          testId: test.testID || test.testId,
          title: test.title,
          description: test.description,
          category: test.category?.toUpperCase(), // Normalize to uppercase
          level: test.level,
          duration: test.duration,
          totalQuestions: test.totalQuestions,
        }));

        console.log("Transformed tests:", transformedTests);

        setTests(transformedTests);
      } catch (err) {
        console.error("Error fetching tests:", err);
        setError("Không thể tải danh sách bài kiểm tra. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  const filteredTests = useMemo(() => {
    if (!selectedCategory) return [];

    console.log("Selected category:", selectedCategory);
    console.log("Available tests:", tests);

    const filtered = tests.filter(
      (test) =>
        test.category &&
        test.category.toUpperCase() === selectedCategory.toUpperCase()
    );

    console.log("Filtered tests:", filtered);

    return filtered;
  }, [selectedCategory, tests]);

  const pageCount = Math.ceil(filteredTests.length / testsPerPage);
  const paginatedTests = filteredTests.slice(
    (page - 1) * testsPerPage,
    page * testsPerPage
  );

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setPage(1);
  };

  const handleBack = () => {
    setSelectedCategory(null);
    setPage(1);
  };

  return (
    <>
      <Navbar />

      {/* Header Section */}
      <Box sx={{ backgroundColor: "#111", color: "white", py: 6 }}>
        <Container>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Bài kiểm tra đánh giá năng lực
          </Typography>
          <Typography variant="body1" color="#ddd">
            Làm bài kiểm tra để xác định trình độ tiếng Anh của bạn và nhận được khuyến nghị khóa học phù hợp
          </Typography>
        </Container>
      </Box>

      <Container sx={{ mt: 4, mb: 4 }}>
        {/* Loading State */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
            <CircularProgress size={60} />
          </Box>
        ) : error ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
            <Alert severity="error" sx={{ maxWidth: 600 }}>
              {error}
            </Alert>
          </Box>
        ) : (
          <>
            {/* Step 1: Select Category */}
            {!selectedCategory ? (
              <Box sx={{ textAlign: "center", py: 1 }}>
                <Typography variant="h4" fontWeight="bold" mb={4}>
                  CHỌN CHỦ ĐỀ KIỂM TRA
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: 3,
                    maxWidth: 400,
                    mx: "auto",
                  }}
                >
                  {["TOEIC", "IELTS", "TOEFL", "GENERAL"].map((cat) => (
                    <Button
                      key={cat}
                      variant="contained"
                      onClick={() => handleCategorySelect(cat)}
                      sx={{
                        height: 100,
                        fontSize: 18,
                        fontWeight: 600,
                        backgroundColor: "#42b8c3ff",   // màu chính đồng bộ
                        color: "#fff",
                        borderRadius: 3,                 // bo tròn giống Navbar
                        boxShadow: 3,
                        textTransform: "uppercase",
                        transition: "all 0.3s ease",
                        "&:hover": { backgroundColor: "#0e5f88ff" }, // hover đậm hơn
                      }}
                    >
                      {cat}
                    </Button>
                  ))}
                </Box>
              </Box>
            ) : (
              <>
                {/* Step 2: Show Tests */}
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={3} flexWrap="wrap" gap={2}>
                  <Button variant="outlined" onClick={handleBack}>
                    ← Quay lại
                  </Button>
                  <Typography variant="h5" fontWeight="bold">
                    Đánh giá năng lực - {selectedCategory}
                  </Typography>
                </Box>

                {paginatedTests.length > 0 ? (
                  <>
                    <Grid container spacing={3} justifyContent="center">
                      {paginatedTests.map((test) => (
                        <Grid key={test.testId} item xs={12} sm={6} md={4}>
                          <TestCard test={test} />
                        </Grid>
                      ))}
                    </Grid>

                    {/* Pagination */}
                    <Stack alignItems="center" mt={4}>
                      <Pagination
                        count={pageCount || 1}
                        page={page}
                        onChange={handlePageChange}
                        color="primary"
                      />
                    </Stack>
                  </>
                ) : (
                  <Typography mt={2} color="text.secondary" textAlign="center">
                    Chưa có bài kiểm tra.
                  </Typography>
                )}
              </>
            )}
          </>
        )}
      </Container>

      <Footer />
    </>
  );
}
