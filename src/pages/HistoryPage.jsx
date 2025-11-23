import {
  Container,
  Grid,
  Typography,
  Box,
  Stack,
  Pagination,
  LinearProgress,
} from "@mui/material";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CourseCard from "../components/CourseCard";
import { mockQuizzes } from "../data/mockQuiz";

export default function HistoryPage() {
  const [historyCourses, setHistoryCourses] = useState([]);
  const [progressData, setProgressData] = useState({});
  const [page, setPage] = useState(1);
  const coursesPerPage = 6;

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("historyCourses")) || [];
    const progress = JSON.parse(localStorage.getItem("courseProgress")) || {};
    setHistoryCourses(stored);
    setProgressData(progress);
  }, []);

  const pageCount = Math.max(
    1,
    Math.ceil(historyCourses.length / coursesPerPage)
  );
  const paginatedCourses = historyCourses.slice(
    (page - 1) * coursesPerPage,
    page * coursesPerPage
  );

  const handlePageChange = (e, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Navbar />
      <Container sx={{ mt: 4, mb: 6 }}>
        <Typography variant="h4" fontWeight="bold" mb={3}>
          Lịch sử học tập
        </Typography>

        {paginatedCourses.length > 0 ? (
          <>
            <Grid container spacing={3}>
              {paginatedCourses.map((course, index) => {
                const cid = Number(course.courseId);
                const courseQuizzes = mockQuizzes.filter(
                  (q) => q.courseId === cid
                );
                const totalQuizzes = courseQuizzes.length || 1;

                const courseProgress = progressData[cid] || {};
                const completed = Object.values(courseProgress).filter(
                  (q) => q && q.completed
                ).length;

                const percent = Math.min(
                  100,
                  Math.round((completed / totalQuizzes) * 100)
                );

                return (
                  <Grid item key={index} xs={12} sm={6} md={4}>
                    <Box sx={{ mb: 2 }}>
                      <CourseCard course={course} />
                      <Box sx={{ mt: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: "bold", mb: 0.5 }}
                        >
                          Tiến độ: {percent}%
                        </Typography>
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
