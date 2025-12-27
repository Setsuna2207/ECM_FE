// src/pages/CoursePage.jsx
import { useParams } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
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
  CircularProgress,
  Alert,
} from "@mui/material";
import CourseCard from "../../components/CourseCard";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import { GetAllCourses } from "../../services/courseService";
import { GetAllLessons } from "../../services/lessonService";
import { GetAllReview } from "../../services/reviewService";

export default function CoursePage() {
  const { category } = useParams();
  const normalized = category?.toUpperCase();

  // State for data
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Bộ lọc
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({
    rating: true,
    lessons: false,
    asc: false,
    desc: true,
  });
  const [appliedFilters, setAppliedFilters] = useState({
    rating: true,
    lessons: false,
    asc: false,
    desc: true,
  });

  //  Phân trang 
  const [page, setPage] = useState(1);
  const coursesPerPage = 6;

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [coursesRes, lessonsRes, reviewsRes] = await Promise.all([
          GetAllCourses(),
          GetAllLessons(),
          GetAllReview(),
        ]);

        setCourses(coursesRes.data || []);
        setLessons(lessonsRes.data || []);
        setReviews(reviewsRes.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Không thể tải dữ liệu khóa học. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const open = Boolean(anchorEl);
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    if (name === "rating" || name === "lessons") {
      setSelectedFilters((prev) => ({
        ...prev,
        rating: name === "rating" ? checked : false,
        lessons: name === "lessons" ? checked : false,
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
      rating: true,
      lessons: false,
      asc: false,
      desc: true,
    };
    setSelectedFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setPage(1);
    setAnchorEl(null);
  };

  //  Số bài giảng + đánh giá 
  const coursesWithStats = useMemo(() => {
    return courses.map((course) => {
      const courseId = course.courseID || course.courseId;

      const lessonCount = lessons.filter(
        (l) => (l.courseID || l.courseId) === courseId
      ).length;

      const courseReviews = reviews.filter(
        (r) => (r.courseID || r.courseId) === courseId
      );

      const rating = course.averageRating ||
        (courseReviews.length > 0
          ? courseReviews.reduce((sum, r) => sum + (r.reviewScore || r.ratingScore || 0), 0) / courseReviews.length
          : 0);

      return {
        ...course,
        courseId: courseId,
        thumbnail: course.thumbnailUrl || course.ThumbnailUrl || course.thumbnail,
        lessonCount,
        rating,
        reviewCount: courseReviews.length
      };
    });
  }, [courses, lessons, reviews]);

  //  Lọc và sắp xếp 
  const filteredCourses = useMemo(() => {
    const filtered = coursesWithStats.filter((c) => {
      // Handle null or undefined categories
      if (!c.categories || !Array.isArray(c.categories)) {
        return false;
      }

      return c.categories.some((cat) => {
        // Handle both object and string category formats
        if (typeof cat === 'object' && cat !== null && cat.name) {
          return cat.name.toUpperCase() === normalized;
        }
        if (typeof cat === 'string') {
          return cat.toUpperCase() === normalized;
        }
        return false;
      });
    });

    return filtered.sort((a, b) => {
      if (appliedFilters.rating) {
        return appliedFilters.asc ? a.rating - b.rating : b.rating - a.rating;
      } else if (appliedFilters.lessons) {
        return appliedFilters.asc
          ? a.lessonCount - b.lessonCount
          : b.lessonCount - a.lessonCount;
      }
      return 0;
    });
  }, [coursesWithStats, normalized, appliedFilters]);

  // Phân trang 
  const pageCount = Math.ceil(filteredCourses.length / coursesPerPage);
  const paginatedCourses = filteredCourses.slice(
    (page - 1) * coursesPerPage,
    page * coursesPerPage
  );

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Navbar />
      <Container sx={{ mt: 2, mb: 4 }}>
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
            {/* Tiêu đề + nút bộ lọc */}
            <Box display="flex" alignItems="center" gap={4} mb={3}>
              <Typography variant="h4" fontWeight="bold">
                {`Khóa học ${normalized}`}
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

            {/* Menu bộ lọc */}
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
                          checked={selectedFilters.rating}
                          onChange={handleCheckboxChange}
                          name="rating"
                          sx={{
                            color: "#6C63FF",
                            "&.Mui-checked": { color: "#6C63FF" },
                          }}
                        />
                      }
                      label="Đánh giá"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={selectedFilters.lessons}
                          onChange={handleCheckboxChange}
                          name="lessons"
                          sx={{
                            color: "#6C63FF",
                            "&.Mui-checked": { color: "#6C63FF" },
                          }}
                        />
                      }
                      label="Số bài giảng"
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

            {/* Danh sách khóa học */}
            {paginatedCourses.length > 0 ? (
              <>
                <Grid container spacing={3} justifyContent="center">
                  {paginatedCourses.map((course) => (
                    <Grid item key={course.courseId} xs={12} sm={6} md={4}>
                      <CourseCard
                        course={course}
                        lessonCount={course.lessonCount}
                        averageRating={course.rating}
                        reviewCount={course.reviewCount}
                      />
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
              <Typography variant="body1" color="text.secondary" mt={2}>
                Không tìm thấy khóa học nào cho mục này.
              </Typography>
            )}
          </>
        )}
      </Container>
      <Footer />
    </>
  );
}
