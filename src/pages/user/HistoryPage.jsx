import {
  Container,
  Grid,
  Typography,
  Box,
  Stack,
  Pagination,
  LinearProgress,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import MiniCourseCard from "../../components/MiniCourseCard";
import { GetAllHistories } from "../../services/historyService";

export default function HistoryPage() {
  const [historyCourses, setHistoryCourses] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const coursesPerPage = 6;

  useEffect(() => {
    fetchHistoryCourses();
  }, []);

  const fetchHistoryCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await GetAllHistories();
      const historyData = response.data || [];

      // Normalize property names
      const normalizedHistory = historyData.map(history => ({
        historyId: history.HistoryID || history.historyID,
        userId: history.UserID || history.userID,
        courseId: history.CourseID || history.courseID,
        progress: history.Progress || history.progress || 0,
        lastAccessed: history.LastAccessed || history.lastAccessed,
        courseTitle: history.CourseTitle || history.courseTitle || "Unknown Course",
        title: history.CourseTitle || history.courseTitle || "Unknown Course",
        thumbnailUrl: history.ThumbnailUrl || history.thumbnailUrl || "",
        totalLessons: history.TotalLessons || history.totalLessons || 0,
        completedLessons: history.CompletedLessons || history.completedLessons || 0,
        description: "", // Not provided by backend
        categories: [], // Not provided by backend
        rating: 0, // Not provided by backend
        totalReviews: 0, // Not provided by backend
      }));

      setHistoryCourses(normalizedHistory);
    } catch (err) {
      console.error("Error fetching history courses:", err);
      setError("Không thể tải lịch sử học tập");
    } finally {
      setLoading(false);
    }
  };

  // --- Pagination ---
  const pageCount = Math.ceil(historyCourses.length / coursesPerPage) || 1;

  const paginatedCourses = historyCourses.slice(
    (page - 1) * coursesPerPage,
    page * coursesPerPage
  );

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Container sx={{ mt: 6, mb: 6, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
          <CircularProgress size={60} />
        </Container>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <Container sx={{ mt: 6, mb: 6 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button variant="contained" onClick={fetchHistoryCourses}>
            Thử lại
          </Button>
        </Container>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <Container sx={{ mt: 4, mb: 6 }}>
        <Typography variant="h4" fontWeight="bold" mb={3}>
          Lịch sử học tập
        </Typography>

        {paginatedCourses.length > 0 ? (
          <>
            <Grid container spacing={3} justifyContent="center">
              {paginatedCourses.map((course) => {
                // Calculate progress percentage
                const percent = Math.min(100, Math.round(course.progress));

                return (
                  <Grid item key={course.historyId} xs={12} sm={6} md={4}>
                    <Box sx={{ mb: 2 }}>
                      <MiniCourseCard course={course} showDescription />

                      {/* Progress bar */}
                      <Box sx={{ mt: 1.5 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: "bold" }}
                          >
                            Tiến độ: {percent}%
                          </Typography>
                        </Box>

                        <LinearProgress
                          variant="determinate"
                          value={percent}
                          sx={{
                            height: 8,
                            borderRadius: 5,
                            backgroundColor: "#eee",
                            "& .MuiLinearProgress-bar": {
                              backgroundColor: "#00df47ff",
                            },
                          }}
                        />
                      </Box>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>

            {/* Pagination */}
            <Stack alignItems="center" mt={4}>
              <Pagination
                count={pageCount}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Stack>
          </>
        ) : (
          <Typography variant="body1" color="text.secondary" mt={2}>
            Bạn chưa tham gia khóa học nào.
          </Typography>
        )}
      </Container>

      <Footer />
    </>
  );
}
