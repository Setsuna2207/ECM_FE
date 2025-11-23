import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Chip,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { useParams, useNavigate } from "react-router-dom";
import { mockCourses } from "../data/mockCourse";
import { mockLessons } from "../data/mockLesson";
import { mockReviews } from "../data/mockReview";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CourseReview from "../components/CourseReview";
import { useEffect, useState } from "react";

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [isFollowed, setIsFollowed] = useState(false);
  const [isJoined, setIsJoined] = useState(false);

  const course = mockCourses.find(
    (c) => c.courseId === parseInt(courseId, 10)
  );

  if (!course) {
    return (
      <>
        <Navbar />
        <Container sx={{ mt: 6, mb: 6 }}>
          <Typography variant="h5" textAlign="center">
            Không tìm thấy khóa học.
          </Typography>
        </Container>
        <Footer />
      </>
    );
  }

  const lessons = mockLessons.filter((l) => l.courseId === course.courseId);
  const courseReviews = mockReviews.filter(
    (r) => r.courseId === course.courseId
  );

  const averageRating =
    courseReviews.length > 0
      ? courseReviews.reduce((acc, r) => acc + r.ratingScore, 0) / courseReviews.length
      : 0;

  // ⭐ Hiển thị sao
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    for (let i = 0; i < 5; i++) {
      stars.push(
        <StarIcon
          key={i}
          sx={{
            color: i < fullStars ? "#FFD700" : "#555",
            fontSize: 20,
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

  const generateRandomBrightColor = () => {
    let color;
    do {
      color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    } while (color === "#77c1f6");
    return color;
  };

  // 🧩 Hàm kiểm tra đăng nhập
  const checkLoginAndNavigate = (lessonId) => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user) {
      alert("Bạn cần đăng nhập để xem chi tiết.");
      return;
    }
    navigate(`/course/${course.courseId}/lesson/${lessonId}`);
  };

  // 🟣 Kiểm tra đã theo dõi / đã tham gia
  useEffect(() => {
    const followed =
      JSON.parse(localStorage.getItem("followedCourses")) || [];
    const joined =
      JSON.parse(localStorage.getItem("courseHistory")) || [];

    setIsFollowed(followed.some((f) => f.courseId === course.courseId));
    setIsJoined(joined.some((c) => c.courseId === course.courseId));
  }, [course.courseId]);

  return (
    <>
      <Navbar />
      <Box sx={{ backgroundColor: "#111", color: "white", py: 6 }}>
        <Container>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: { xs: "wrap", md: "nowrap" },
              gap: 4,
            }}
          >
            {/* Cột trái: thông tin khóa học */}
            <Box sx={{ flex: "1 1 55%", minWidth: 320, maxWidth: 650 }}>
              <Typography
                variant="h4"
                fontWeight="bold"
                gutterBottom
                sx={{ wordBreak: "break-word" }}
              >
                {course.title}
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  mb: 2,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  color: "#ddd",
                }}
              >
                {course.description}
              </Typography>

              <Box display="flex" alignItems="center" flexWrap="wrap" gap={1.5} mb={2}>
                <Box display="flex" alignItems="center">
                  {renderStars(averageRating)}
                  <Typography variant="body2" sx={{ ml: 0.5 }}>
                    {averageRating.toFixed(1)} / 5 ({courseReviews.length} đánh giá)
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <MenuBookIcon sx={{ fontSize: 18 }} />
                  <Typography variant="body2">
                    {lessons.length} bài giảng
                  </Typography>
                </Box>
              </Box>

              <Box display="flex" gap={2} mt={2}>
                {/* 🟢 Nút Tham gia khóa học */}
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: "#1976d2",
                    color: "white",
                    textTransform: "none",
                    fontWeight: "bold",
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    "&:hover": { backgroundColor: "#1259a7" },
                  }}
                  onClick={() => {
                    const user = JSON.parse(localStorage.getItem("currentUser"));
                    if (!user) {
                      alert("Bạn cần đăng nhập để tham gia khóa học.");
                      return;
                    }

                    // 🔹 Lấy danh sách khóa học đã tham gia
                    const joinedCourses =
                      JSON.parse(localStorage.getItem("historyCourses")) || [];

                    // 🔹 Kiểm tra xem khóa học đã có trong lịch sử chưa
                    const alreadyJoined = joinedCourses.some(
                      (c) => c.courseId === course.courseId
                    );

                    if (!alreadyJoined) {
                      joinedCourses.push({
                        courseId: course.courseId,
                        title: course.title,
                        thumbnail: course.thumbnail,
                      });
                      localStorage.setItem("historyCourses", JSON.stringify(joinedCourses));
                      alert(`Đã tham gia khóa học "${course.title}".`);
                    }

                    // 🔹 Chuyển đến bài học đầu tiên
                    const firstLesson = lessons.sort((a, b) => a.orderIndex - b.orderIndex)[0];
                    if (firstLesson) checkLoginAndNavigate(firstLesson.lessonId);
                  }}
                >
                  Tham gia khóa học
                </Button>


                {/* 🟣 Nút Theo dõi khóa học */}
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: isFollowed ? "#999" : "#73169aff",
                    color: "white",
                    textTransform: "none",
                    fontWeight: "bold",
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    "&:hover": {
                      backgroundColor: isFollowed ? "#888" : "#400859ff",
                    },
                  }}
                  onClick={() => {
                    const user = JSON.parse(localStorage.getItem("currentUser"));
                    if (!user) {
                      alert("Bạn cần đăng nhập để theo dõi khóa học.");
                      return;
                    }

                    const followed =
                      JSON.parse(localStorage.getItem("followedCourses")) || [];

                    // Nếu đã theo dõi → hỏi xác nhận hủy
                    if (isFollowed) {
                      const confirmUnfollow = window.confirm(
                        "Bạn đang theo dõi khóa học này!\nCó muốn hủy theo dõi không?"
                      );
                      if (confirmUnfollow) {
                        const updated = followed.filter(
                          (f) => f.courseId !== course.courseId
                        );
                        localStorage.setItem(
                          "followedCourses",
                          JSON.stringify(updated)
                        );
                        setIsFollowed(false);
                        alert(`Đã hủy theo dõi khóa học "${course.title}"`);
                      }
                      return;
                    }

                    // Nếu chưa theo dõi → thêm vào localStorage
                    followed.push({
                      courseId: course.courseId,
                      title: course.title,
                      thumbnail: course.thumbnail,
                      categories: course.categories || [],
                    });
                    localStorage.setItem("followedCourses", JSON.stringify(followed));
                    setIsFollowed(true);
                    alert(`Đã theo dõi khóa học "${course.title}"`);
                  }}
                >
                  {isFollowed ? "Đang theo dõi" : "Theo dõi khóa học"}
                </Button>

              </Box>
            </Box>

            {/* Cột phải: thumbnail */}
            <Box
              sx={{
                flex: "1 1 40%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Box
                component="img"
                src={course.thumbnail}
                alt={course.title}
                sx={{
                  width: "100%",
                  maxWidth: 420,
                  borderRadius: 3,
                  boxShadow: 4,
                  objectFit: "cover",
                }}
              />
            </Box>
          </Box>
        </Container>
      </Box>

      {/* 🔽 Nội dung khóa học + đánh giá */}
      <Container sx={{ mt: 5, mb: 8 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Mô tả khóa học
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 5 }}>
          {course.description}
        </Typography>

        <Box sx={{ mb: 5 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Chủ đề liên quan
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1.5}>
            {levelCategory && (
              <Chip
                label={levelCategory.name}
                clickable
                color="primary"
                sx={{
                  fontWeight: 600,
                  height: 28,
                  px: 1,
                  "&:hover": { backgroundColor: "#4038d2ff", color: "white" },
                }}
                onClick={() =>
                  navigate(`/courses/${levelCategory.name.toLowerCase()}`)
                }
              />
            )}
            {skillCategory && (
              <Chip
                label={skillCategory.name}
                clickable
                color="secondary"
                sx={{
                  fontWeight: 600,
                  height: 28,
                  px: 1,
                  "&:hover": { backgroundColor: "#73169aff", color: "white" },
                }}
                onClick={() =>
                  navigate(`/courses/${skillCategory.name.toLowerCase()}`)
                }
              />
            )}
          </Box>
        </Box>

        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Nội dung khóa học
        </Typography>

        <Box sx={{ mt: 2, borderRadius: 2, overflow: "hidden", boxShadow: 2 }}>
          {lessons.map((lesson, index) => (
            <div key={lesson.lessonId}>
              <Card
                onClick={() => checkLoginAndNavigate(lesson.lessonId)}
                sx={{
                  mb: 1,
                  borderRadius: 0,
                  boxShadow: "none",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: "#f5f5f5",
                    transform: "scale(1.01)",
                    cursor: "pointer",
                  },
                }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 2,
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: "50%",
                        backgroundColor: generateRandomBrightColor(),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 22,
                        fontWeight: "bold",
                      }}
                    >
                      📄
                    </Box>

                    <Typography variant="subtitle1" fontWeight="600">
                      Bài giảng {index + 1}: {lesson.title}
                    </Typography>
                  </Box>

                  <Button
                    size="small"
                    variant="outlined"
                    sx={{
                      borderColor: "#1976d2",
                      color: "#1976d2",
                      textTransform: "none",
                      fontWeight: "bold",
                      borderRadius: 2,
                      "&:hover": { backgroundColor: "#E3F2FD" },
                    }}
                  >
                    Xem bài học
                  </Button>
                </CardContent>
              </Card>

              {index < lessons.length - 1 && <Divider sx={{ my: 2 }} />}
            </div>
          ))}
        </Box>

        {/* ✅ Phần đánh giá */}
        <Box mt={6}>
          <CourseReview courseId={course.courseId} />
        </Box>
      </Container>

      <Footer />
    </>
  );
}
