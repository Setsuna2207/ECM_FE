import {
  Container,
  Grid,
  Typography,
  Stack,
  Pagination,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import CourseCard from "../../components/CourseCard";
import { GetAllFollowing } from "../../services/followingService";
import { GetCourseById } from "../../services/courseService";

export default function FollowingPage() {
  const [followedCourses, setFollowedCourses] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const coursesPerPage = 6;

  useEffect(() => {
    fetchFollowedCourses();
  }, []);

  const fetchFollowedCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await GetAllFollowing();
      const followingData = response.data || [];

      // Fetch full course details for each followed course
      const coursePromises = followingData.map(async (following) => {
        try {
          const courseId = following.CourseID || following.courseID;
          const courseRes = await GetCourseById(courseId);
          const courseData = courseRes.data;

          // Normalize property names
          return {
            courseId: courseData.CourseID || courseData.courseId,
            title: courseData.Title || courseData.title,
            description: courseData.Description || courseData.description,
            thumbnailUrl: courseData.ThumbnailUrl || courseData.thumbnailUrl,
            createdAt: courseData.CreatedAt || courseData.createdAt,
            totalLessons: courseData.TotalLessons || courseData.totalLessons || 0,
            totalReviews: courseData.TotalReviews || courseData.totalReviews || 0,
            rating: courseData.AverageRating || courseData.averageRating || 0,
            categories: courseData.Categories || courseData.categories || [],
          };
        } catch (err) {
          console.error(`Error fetching course ${following.CourseID}:`, err);
          // Return basic info from following if full course fetch fails
          return {
            courseId: following.CourseID || following.courseID,
            title: following.Title || following.title || "Unknown Course",
            thumbnailUrl: following.ThumbnailUrl || following.thumbnailUrl || "",
            description: "",
            totalLessons: 0,
            totalReviews: 0,
            rating: 0,
            categories: [],
          };
        }
      });

      const courses = await Promise.all(coursePromises);
      setFollowedCourses(courses);
    } catch (err) {
      console.error("Error fetching followed courses:", err);
      setError("Không thể tải danh sách khóa học đang theo dõi");
    } finally {
      setLoading(false);
    }
  };

  // --- Pagination ---
  const pageCount = Math.ceil(followedCourses.length / coursesPerPage);
  const paginatedCourses = followedCourses.slice(
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
          <Button variant="contained" onClick={fetchFollowedCourses}>
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
          Khóa học đang theo dõi
        </Typography>

        {paginatedCourses.length > 0 ? (
          <>
            <Grid container spacing={3} justifyContent="center">
              {paginatedCourses.map((course) => (
                <Grid item key={course.courseId} xs={12} sm={6} md={4}>
                  <CourseCard course={course} />
                </Grid>
              ))}
            </Grid>

            {/* Pagination - always show at least 1 */}
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
            Bạn chưa theo dõi khóa học nào.
          </Typography>
        )}
      </Container>

      <Footer />
    </>
  );
}
