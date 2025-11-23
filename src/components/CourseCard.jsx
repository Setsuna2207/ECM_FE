import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { mockLessons } from "../data/mockLesson";
import { mockReviews } from "../data/mockReview";
import { useNavigate } from "react-router-dom";

export default function CourseCard({ course }) {
  const navigate = useNavigate();

  // 🔹 Tính số lượng bài giảng trong khóa học
  const lessonCount = mockLessons.filter(
    (lesson) => lesson.courseId === course.courseId
  ).length;

  // 🔹 Tính điểm trung bình từ mockReview
  const courseReviews = mockReviews.filter(
    (review) => review.courseId === course.courseId
  );
  const averageRating =
    courseReviews.length > 0
      ? courseReviews.reduce((sum, r) => sum + r.ratingScore, 0) /
        courseReviews.length
      : 0;

  // 🔹 Hàm hiển thị sao vàng / trắng
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    for (let i = 0; i < 5; i++) {
      stars.push(
        <StarIcon
          key={i}
          sx={{
            color: i < fullStars ? "#FFD700" : "#E0E0E0",
            fontSize: 16,
          }}
        />
      );
    }
    return stars;
  };

  // 🔹 Lấy level và skill từ categories
  const levelCategory = course.categories?.find(
    (cat) => cat.description === "LEVEL"
  );
  const skillCategory = course.categories?.find(
    (cat) => cat.description === "SKILL"
  );

  return (
    <Card
      sx={{
        width: 550,
        borderRadius: 3,
        boxShadow: 3,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <CardMedia
        component="img"
        height="180"
        image={course.thumbnail}
        alt={course.title}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Tiêu đề */}
        <Typography variant="h6" fontWeight="bold">
          {course.title}
        </Typography>

        {/* Mô tả rút gọn 1 dòng */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "normal",
            mb: 1,
          }}
        >
          {course.description}
        </Typography>

        {/* === Category + Rating + Lessons trên 1 dòng === */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          gap={1}
          mt={0.5}
        >
          {/* Category */}
          <Box display="flex" alignItems="center" gap={0.8}>
            {levelCategory && (
              <Chip
                label={levelCategory.name}
                size="small"
                color="primary"
                sx={{
                  fontWeight: 600,
                  height: 22,
                }}
              />
            )}
            {skillCategory && (
              <Chip
                label={skillCategory.name}
                size="small"
                color="secondary"
                sx={{
                  fontWeight: 600,
                  height: 22,
                }}
              />
            )}
          </Box>

          {/* Rating + Lessons */}
          <Box display="flex" alignItems="center" gap={1}>
            <Box display="flex" alignItems="center">
              {renderStars(averageRating)}
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ ml: 0.5, fontWeight: 500 }}
              >
                {averageRating.toFixed(1)}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" ml={0.5}>
              <MenuBookIcon
                sx={{ color: "text.secondary", fontSize: 16, mr: 0.3 }}
              />
              <Typography variant="body2" color="text.secondary">
                {lessonCount}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Nút xem chi tiết */}
        <Button
          variant="contained"
          fullWidth
          sx={{
            mt: 2,
            backgroundColor: "#4038d2ff",
            "&:hover": {
              backgroundColor: "#73169aff",
            },
          }}
          onClick={() => navigate(`/course/${course.courseId}`)}
        >
          Xem chi tiết
        </Button>
      </CardContent>
    </Card>
  );
}
