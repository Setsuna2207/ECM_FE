import {
  Container,
  Grid,
  Typography,
  Box,
  Stack,
  Pagination,
} from "@mui/material";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CourseCard from "../components/CourseCard";
import { mockCourses } from "../data/mockCourse";

export default function FollowedPage() {
  const [followedCourses, setFollowedCourses] = useState([]);
  const [page, setPage] = useState(1);
  const coursesPerPage = 6;

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("followedCourses")) || [];

    // 🔹 Ghép thông tin course đầy đủ từ mockCourses để có categories, description, ...
    const merged = stored.map((f) => {
      const fullInfo = mockCourses.find((c) => c.courseId === f.courseId);
      return fullInfo ? { ...fullInfo } : f;
    });

    setFollowedCourses(merged);
  }, []);

  const pageCount = Math.ceil(followedCourses.length / coursesPerPage) || 1;
  const paginatedCourses = followedCourses.slice(
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
          Khóa học đang theo dõi
        </Typography>

        {paginatedCourses.length > 0 ? (
          <>
            <Grid container spacing={3} justifyContent="center">
              {paginatedCourses.map((course, index) => (
                <Grid item key={index} xs={12} sm={6} md={4}>
                  <CourseCard course={course} />
                </Grid>
              ))}
            </Grid>

            {/* ✅ Luôn hiển thị phân trang, kể cả khi chỉ có 1 trang */}
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
            Bạn chưa theo dõi khóa học nào.
          </Typography>
        )}
      </Container>
      <Footer />
    </>
  );
}
