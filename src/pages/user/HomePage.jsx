import { Grid, Container, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CourseCard from "../../components/CourseCard";
import { mockCourses } from "../../data/mockCourse";
import { mockReviews } from "../../data/mockReview";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";

// Hàm tính rating trung bình cho mỗi khóa học
const getAverageRating = (courseId) => {
  const courseReviews = mockReviews.filter((r) => r.courseId === courseId);
  if (courseReviews.length === 0) return 0;
  const total = courseReviews.reduce((sum, r) => sum + r.ratingScore, 0);
  return total / courseReviews.length;
};

export default function HomePage() {
  const navigate = useNavigate();

  // Gắn rating trung bình vào danh sách khóa học
  const coursesWithRating = mockCourses.map((course) => ({
    ...course,
    rating: getAverageRating(course.courseId),
  }));

  // Lọc khóa học theo từng nhóm LEVEL
  const toeicCourses = coursesWithRating.filter((c) =>
    c.categories?.some(
      (cat) => cat.description === "LEVEL" && cat.name.toUpperCase() === "TOEIC"
    )
  );

  const ieltsCourses = coursesWithRating.filter((c) =>
    c.categories?.some(
      (cat) => cat.description === "LEVEL" && cat.name.toUpperCase() === "IELTS"
    )
  );

  const toeflCourses = coursesWithRating.filter((c) =>
    c.categories?.some(
      (cat) => cat.description === "LEVEL" && cat.name.toUpperCase() === "TOEFL"
    )
  );

  const generalCourses = coursesWithRating.filter((c) =>
    c.categories?.some(
      (cat) => cat.description === "LEVEL" && cat.name.toUpperCase() === "GENERAL"
    )
  );


  // ✅ Hàm hiển thị từng nhóm khóa học (lọc ≥ 4.5)
  const renderCourseSection = (title, courses, route, description) => {
    const topCourses = courses
      .filter((course) => course.rating >= 4.5)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4);

    if (topCourses.length === 0) return null;

    return (
      <>
        <Box display="flex" alignItems="center" gap={5} mt={4} mb={2}>
          <Typography variant="h5" fontWeight="bold">
            {title}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate(route)}
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
            Khám phá thêm
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary" mb={2}>
          {description}
        </Typography>

        <Grid container spacing={3} justifyContent="center">
          {topCourses.map((course) => (
            <Grid item key={course.courseId} xs={12} sm={6} md={4}>
              <CourseCard course={course} />
            </Grid>
          ))}
        </Grid>
      </>
    );
  };

  return (
    <>
      <Navbar />
      <Container sx={{ mt: 4, mb: 6, px: { xs: 2, sm: 4 } }}>
        <Typography variant="h4" fontWeight="bold" mb={4} color="#0a0749ff">
          Khóa học nổi bật
        </Typography>

        {renderCourseSection(
          "Khóa học TOEIC",
          toeicCourses,
          "/courses/toeic",
          "Các khóa học TOEIC giúp bạn cải thiện kỹ năng tiếng Anh để đạt điểm cao trong kỳ thi TOEIC."
        )}
        {renderCourseSection(
          "Khóa học IELTS",
          ieltsCourses,
          "/courses/ielts",
          "Các khóa học IELTS cung cấp kiến thức và kỹ năng cần thiết để đạt điểm cao trong kỳ thi IELTS."
        )}
        {renderCourseSection(
          "Khóa học TOEFL",
          toeflCourses,
          "/courses/toefl",
          "Các khóa học TOEFL giúp bạn chuẩn bị tốt nhất cho kỳ thi TOEFL với các bài học chuyên sâu."
        )}
        {renderCourseSection(
          "Khóa học General",
          generalCourses,
          "/courses/general",
          "Các khóa học General giúp bạn nâng cao kỹ năng tiếng Anh tổng quát cho công việc và cuộc sống."
        )}
      </Container>

      <Footer />
    </>
  );
}
