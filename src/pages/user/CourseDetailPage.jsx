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
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useParams, useNavigate } from "react-router-dom";
import { mockCourses } from "../../data/mockCourse";
import { mockLessons } from "../../data/mockLesson";
import { mockReviews } from "../../data/mockReview";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import CourseReview from "../../components/CourseReview";
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

  // Hiển thị rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    for (let i = 0; i < 5; i++) {
      stars.push(
        <StarIcon
          key={i}
          sx={{
            color: i < fullStars ? "#FFB800" : "#dcdadaff",
            fontSize: 22,
            filter: i < fullStars ? "drop-shadow(0 0 2px rgba(255,184,0,0.5))" : "none",
          }}
        />
      );
    }
    return stars;
  };

  // Lấy level và skill từ categories
  const levelCategory = course.categories?.find(
    (cat) => cat.description === "LEVEL"
  );
  const skillCategory = course.categories?.find(
    (cat) => cat.description === "SKILL"
  );

  const generateRandomBrightColor = () => {
    const colors = [
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Hàm kiểm tra đăng nhập
  const checkLoginAndNavigate = (lessonId) => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user) {
      alert("Bạn cần đăng nhập để xem chi tiết.");
      return;
    }
    navigate(`/course/${course.courseId}/lesson/${lessonId}`);
  };

  // Kiểm tra đã theo dõi / đã tham gia
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
      <Box sx={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        color: "white",
        py: 8,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.1) 0%, transparent 50%)",
        }
      }}>
        <Container sx={{ position: "relative", zIndex: 1 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: { xs: "wrap", md: "nowrap" },
              gap: 4,
            }}
          >
            {/* Thông tin khóa học */}
            <Box sx={{ flex: "1 1 55%", minWidth: 320, maxWidth: 650 }}>
              <Typography
                variant="h4"
                fontWeight="bold"
                gutterBottom
                sx={{
                  wordBreak: "break-word",
                }}
              >
                {course.title}
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  mb: 3,
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

              <Box display="flex" alignItems="center" flexWrap="wrap" gap={2.5} mb={3}>
                <Box
                  display="flex"
                  alignItems="center"
                  sx={{
                    backgroundColor: "rgba(255,255,255,0.1)",
                    backdropFilter: "blur(10px)",
                    borderRadius: 2,
                    px: 2,
                    py: 0.8,
                  }}
                >
                  {renderStars(averageRating)}
                  <Typography variant="body2" sx={{ ml: 1, fontWeight: 600 }}>
                    {averageRating.toFixed(1)} / 5
                  </Typography>
                  <Typography variant="body2" sx={{ ml: 0.5, color: "#bbb" }}>
                    ({courseReviews.length})
                  </Typography>
                </Box>
                <Box
                  display="flex"
                  alignItems="center"
                  gap={1}
                  sx={{
                    backgroundColor: "rgba(255,255,255,0.1)",
                    backdropFilter: "blur(10px)",
                    borderRadius: 2,
                    px: 2,
                    py: 0.8,
                  }}
                >
                  <MenuBookIcon sx={{ fontSize: 20, color: "#4facfe" }} />
                  <Typography variant="body2" fontWeight={600}>
                    {lessons.length} bài giảng
                  </Typography>
                </Box>
              </Box>

              <Box display="flex" gap={2} mt={3}>
                {/* Nút Tham gia */}
                <Button
                  variant="contained"
                  startIcon={<PlayCircleOutlineIcon />}
                  sx={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    textTransform: "none",
                    fontWeight: "700",
                    fontSize: "1rem",
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    boxShadow: "0 8px 20px rgba(102, 126, 234, 0.4)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 12px 28px rgba(102, 126, 234, 0.5)",
                    },
                  }}
                  onClick={() => {
                    const user = JSON.parse(localStorage.getItem("currentUser"));
                    if (!user) {
                      alert("Bạn cần đăng nhập để tham gia khóa học.");
                      return;
                    }

                    const joinedCourses =
                      JSON.parse(localStorage.getItem("historyCourses")) || [];

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

                    const firstLesson = lessons.sort((a, b) => a.orderIndex - b.orderIndex)[0];
                    if (firstLesson) checkLoginAndNavigate(firstLesson.lessonId);
                  }}
                >
                  Tham gia khóa học
                </Button>

                {/* Nút Theo dõi */}
                <Button
                  variant="outlined"
                  startIcon={isFollowed ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  sx={{
                    borderColor: "rgba(255,255,255,0.3)",
                    color: "white",
                    textTransform: "none",
                    fontWeight: "600",
                    fontSize: "1rem",
                    borderRadius: 3,
                    px: 3,
                    py: 1.5,
                    backgroundColor: isFollowed ? "rgba(244, 63, 94, 0.2)" : "rgba(255,255,255,0.05)",
                    backdropFilter: "blur(10px)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      borderColor: "#f43f5e",
                      backgroundColor: "rgba(244, 63, 94, 0.15)",
                      transform: "translateY(-2px)",
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
                  {isFollowed ? "Đang theo dõi" : "Theo dõi"}
                </Button>
              </Box>
            </Box>

            {/* Thumbnail */}
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
                  borderRadius: 4,
                  boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                  objectFit: "cover",
                  border: "3px solid rgba(255,255,255,0.1)",
                  transition: "transform 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.03)",
                  }
                }}
              />
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Nội dung khóa học + đánh giá */}
      <Container sx={{ mt: 6, mb: 8 }}>
        <Typography
          variant="h5"
          fontWeight="bold"
          gutterBottom
        >
          Mô tả khóa học
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 6 }}
        >
          {course.description}
        </Typography>

        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h6"
            fontWeight="bold"
            gutterBottom
          >
            Chủ đề liên quan
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1.5}>
            {levelCategory && (
              <Chip
                label={levelCategory.name}
                clickable
                sx={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  height: 36,
                  px: 2,
                  borderRadius: 3,
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 16px rgba(102, 126, 234, 0.4)",
                  },
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
                sx={{
                  background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  height: 36,
                  px: 2,
                  borderRadius: 3,
                  boxShadow: "0 4px 12px rgba(240, 147, 251, 0.3)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "linear-gradient(135deg, #f5576c 0%, #f093fb 100%)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 16px rgba(240, 147, 251, 0.4)",
                  },
                }}
                onClick={() =>
                  navigate(`/courses/${skillCategory.name.toLowerCase()}`)
                }
              />
            )}
          </Box>
        </Box>

        <Typography
          variant="h5"
          fontWeight="bold"
          gutterBottom
        >
          Nội dung khóa học
        </Typography>

        <Box sx={{ mt: 3 }}>
          {lessons.map((lesson, index) => (
            <div key={lesson.lessonId}>
              <Card
                onClick={() => checkLoginAndNavigate(lesson.lessonId)}
                sx={{
                  mb: 2,
                  borderRadius: 3,
                  border: "2px solid transparent",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    borderColor: "#667eea",
                    backgroundColor: "#f8fafc",
                    transform: "translateX(8px)",
                    boxShadow: "0 8px 24px rgba(102, 126, 234, 0.15)",
                    cursor: "pointer",
                  },
                }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 3,
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2.5}>
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: 3,
                        background: generateRandomBrightColor(),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 24,
                        fontWeight: "bold",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      }}
                    >
                      📄
                    </Box>

                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#94a3b8",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Bài giảng {index + 1}
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight="700"
                        sx={{
                          color: "#1e293b",
                          mt: 0.5,
                        }}
                      >
                        {lesson.title}
                      </Typography>
                    </Box>
                  </Box>

                  <Button
                    size="medium"
                    variant="contained"
                    startIcon={<PlayCircleOutlineIcon />}
                    sx={{
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white",
                      textTransform: "none",
                      fontWeight: "700",
                      borderRadius: 2.5,
                      px: 3,
                      py: 1,
                      boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                        boxShadow: "0 6px 16px rgba(102, 126, 234, 0.4)",
                      },
                    }}
                  >
                    Xem bài học
                  </Button>
                </CardContent>
              </Card>

              {index < lessons.length - 1 && (
                <Divider sx={{ my: 0, opacity: 0 }} />
              )}
            </div>
          ))}
        </Box>

        {/* Phần đánh giá */}
        <Box mt={8}>
          <CourseReview courseId={course.courseId} />
        </Box>
      </Container>

      <Footer />
    </>
  );
}