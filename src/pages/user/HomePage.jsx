import { Grid, Container, Typography, Button, Box, Chip, Avatar, CircularProgress, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import CourseCard from "../../components/CourseCard";
import { GetAllCourses } from "../../services/courseService";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import FiberNewIcon from "@mui/icons-material/FiberNew";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

// Hàm giả lập AI recommendation dựa trên mục tiêu học tập của user
const getAIRecommendations = (userGoal, courses) => {
  if (!userGoal || userGoal.trim() === "") return [];

  const goalLower = userGoal.toLowerCase();

  // Phân tích mục tiêu để tìm keywords
  const keywords = {
    toeic: goalLower.includes("toeic"),
    ielts: goalLower.includes("ielts"),
    toefl: goalLower.includes("toefl"),
    grammar: goalLower.includes("grammar") || goalLower.includes("ngữ pháp"),
    vocabulary: goalLower.includes("vocabulary") || goalLower.includes("từ vựng"),
    listening: goalLower.includes("listening") || goalLower.includes("nghe"),
    speaking: goalLower.includes("speaking") || goalLower.includes("nói"),
    reading: goalLower.includes("reading") || goalLower.includes("đọc"),
    writing: goalLower.includes("writing") || goalLower.includes("viết"),
  };

  // Lọc courses phù hợp với keywords
  const recommended = courses.filter((course) => {
    const categories = course.Categories || course.categories || [];

    return categories.some((cat) => {
      const catName = typeof cat === 'string' ? cat.toLowerCase() : cat.name?.toLowerCase() || '';

      if (keywords.toeic && catName.includes("toeic")) return true;
      if (keywords.ielts && catName.includes("ielts")) return true;
      if (keywords.toefl && catName.includes("toefl")) return true;
      if (keywords.grammar && catName.includes("grammar")) return true;
      if (keywords.vocabulary && catName.includes("vocabulary")) return true;
      if (keywords.listening && catName.includes("listening")) return true;
      if (keywords.speaking && catName.includes("speaking")) return true;
      if (keywords.reading && catName.includes("reading")) return true;
      if (keywords.writing && catName.includes("writing")) return true;

      return false;
    });
  });

  // Sắp xếp theo rating và trả về tối đa 6 courses
  return recommended
    .sort((a, b) => (b.AverageRating || b.averageRating || 0) - (a.AverageRating || a.averageRating || 0))
    .slice(0, 6);
};

export default function HomePage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [learningGoal, setLearningGoal] = useState("");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Lấy thông tin user và mục tiêu học tập
    const user = JSON.parse(localStorage.getItem("currentUser"));
    const goal = localStorage.getItem("learningGoal") || "";
    setCurrentUser(user);
    setLearningGoal(goal);

    // Fetch courses from backend
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await GetAllCourses();
      const coursesData = response.data || [];

      // Normalize property names for consistency
      const normalizedCourses = coursesData.map(course => ({
        ...course,
        courseId: course.CourseID || course.courseId,
        title: course.Title || course.title,
        description: course.Description || course.description,
        thumbnailUrl: course.ThumbnailUrl || course.thumbnailUrl,
        createdAt: course.CreatedAt || course.createdAt,
        totalLessons: course.TotalLessons || course.totalLessons || 0,
        totalReviews: course.TotalReviews || course.totalReviews || 0,
        rating: course.AverageRating || course.averageRating || 0,
        categories: course.Categories || course.categories || [],
      }));

      setCourses(normalizedCourses);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError("Không thể tải danh sách khóa học");
    } finally {
      setLoading(false);
    }
  };

  // AI Recommendations
  const aiRecommendedCourses = currentUser
    ? getAIRecommendations(learningGoal, courses)
    : [];

  // New Courses - Sort by createdAt (newest first), max 6
  const newCourses = [...courses]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  // Lọc khóa học theo từng nhóm LEVEL (categories là array of strings từ backend)
  const toeicCourses = courses.filter((c) => {
    const categories = c.categories || [];
    return categories.some(cat => {
      const catName = typeof cat === 'string' ? cat : cat.name || '';
      return catName.toUpperCase().includes("TOEIC");
    });
  });

  const ieltsCourses = courses.filter((c) => {
    const categories = c.categories || [];
    return categories.some(cat => {
      const catName = typeof cat === 'string' ? cat : cat.name || '';
      return catName.toUpperCase().includes("IELTS");
    });
  });

  const toeflCourses = courses.filter((c) => {
    const categories = c.categories || [];
    return categories.some(cat => {
      const catName = typeof cat === 'string' ? cat : cat.name || '';
      return catName.toUpperCase().includes("TOEFL");
    });
  });

  const generalCourses = courses.filter((c) => {
    const categories = c.categories || [];
    return categories.some(cat => {
      const catName = typeof cat === 'string' ? cat : cat.name || '';
      return catName.toUpperCase().includes("GENERAL");
    });
  });

  // Hàm hiển thị AI Recommendations
  const renderAIRecommendations = () => {
    if (!currentUser || aiRecommendedCourses.length === 0) return null;

    return (
      <Box sx={{ mb: 6 }}>
        <Box
          display="flex"
          alignItems="center"
          gap={2}
          mb={2}
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: 3,
            p: 2,
            color: "white",
          }}
        >
          <AutoAwesomeIcon
            sx={{
              fontSize: 32,
              animation: "pulse 2s infinite",
              "@keyframes pulse": {
                "0%, 100%": { opacity: 1, transform: "scale(1)" },
                "50%": { opacity: 0.7, transform: "scale(1.1)" },
              },
            }}
          />
          <Box flex={1}>
            <Typography variant="h5" fontWeight="bold">
              Gợi ý dành riêng cho bạn
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              Dựa trên mục tiêu: "{learningGoal || "Chưa thiết lập"}"
            </Typography>
          </Box>
          <Chip
            label="AI Powered"
            size="small"
            sx={{
              backgroundColor: "rgba(255,255,255,0.2)",
              color: "white",
              fontWeight: "bold",
              backdropFilter: "blur(10px)",
            }}
          />
        </Box>

        <Grid container spacing={3} justifyContent={ "center" }>
          {aiRecommendedCourses.map((course) => (
            <Grid item key={course.courseId} xs={12} sm={6} md={4}>
              <CourseCard course={course} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  // Hàm hiển thị New Courses
  const renderNewCourses = () => {
    if (newCourses.length === 0) return null;

    return (
      <Box sx={{ mb: 6 }}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <FiberNewIcon sx={{ fontSize: 32, color: "#ef4444" }} />
          <Typography variant="h5" fontWeight="bold" color="#0a0749ff">
            Khóa học mới nhất
          </Typography>
          <Chip
            label="New"
            size="small"
            sx={{
              backgroundColor: "#fef2f2",
              color: "#ef4444",
              fontWeight: "bold",
              border: "1px solid #fecaca",
            }}
          />
        </Box>

        <Typography variant="body2" color="text.secondary" mb={2}>
          Khám phá những khóa học mới được cập nhật gần đây
        </Typography>

        <Grid container spacing={3} justifyContent={ "center" }>
          {newCourses.map((course) => (
            <Grid item key={course.courseId} xs={12} sm={6} md={4}>
              <CourseCard course={course} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  // Hàm hiển thị từng nhóm khóa học (top rating)
  const renderCourseSection = (title, courses, route, description, icon) => {
    const topCourses = courses
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4);

    if (topCourses.length === 0) return null;

    return (
      <Box sx={{ mb: 6 }}>
        <Box display="flex" alignItems="center" gap={2} mb={2} >
          {icon && <Box sx={{ fontSize: 32 }}>{icon}</Box>}
          <Typography variant="h5" fontWeight="bold" color="#0a0749ff">
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

        <Grid container spacing={3} justifyContent={ "center" }>
          {topCourses.map((course) => (
            <Grid item key={course.courseId} xs={12} sm={6} md={4}>
              <CourseCard course={course} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
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
          <Button variant="contained" onClick={fetchCourses}>
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
      <Container sx={{ mt: 4, mb: 6, px: { xs: 2, sm: 4 } }}>
        {/* Hero Section with Welcome Message */}
        {currentUser && (
          <Box
            sx={{
              background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
              borderRadius: 4,
              p: 3,
              mb: 4,
              border: "2px solid #bae6fd",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Avatar
              src={currentUser.avatar}
              alt={currentUser.fullName}
              sx={{ width: 56, height: 56, border: "3px solid #0ea5e9" }}
            />
            <Box flex={1}>
              <Typography variant="h5" fontWeight="bold" color="#0c4a6e">
                Xin chào, {currentUser.fullName || currentUser.userName}! 👋
              </Typography>
              <Typography variant="body2" color="#0369a1" sx={{ mt: 0.5 }}>
                Hãy tiếp tục hành trình học tập của bạn ngày hôm nay
              </Typography>
            </Box>
          </Box>
        )}

        {/* AI Recommendations Section */}
        {renderAIRecommendations()}

        {/* New Courses Section */}
        {renderNewCourses()}

        {/* Top Rated Courses Header */}
        <Box display="flex" alignItems="center" gap={2} mb={4} mt={6} >
          <TrendingUpIcon sx={{ fontSize: 32, color: "#4038d2ff" }} />
          <Typography variant="h4" fontWeight="bold" color="#0a0749ff">
            Khóa học được đánh giá cao
          </Typography>
        </Box>

        {/* Top Rated Courses by Level */}
        {renderCourseSection(
          "Khóa học TOEIC",
          toeicCourses,
          "/courses/toeic",
          "Các khóa học TOEIC giúp bạn cải thiện kỹ năng tiếng Anh để đạt điểm cao trong kỳ thi TOEIC.",
          "🎯"
        )}
        {renderCourseSection(
          "Khóa học IELTS",
          ieltsCourses,
          "/courses/ielts",
          "Các khóa học IELTS cung cấp kiến thức và kỹ năng cần thiết để đạt điểm cao trong kỳ thi IELTS.",
          "🌟"
        )}
        {renderCourseSection(
          "Khóa học TOEFL",
          toeflCourses,
          "/courses/toefl",
          "Các khóa học TOEFL giúp bạn chuẩn bị tốt nhất cho kỳ thi TOEFL với các bài học chuyên sâu.",
          "📚"
        )}
        {renderCourseSection(
          "Khóa học General",
          generalCourses,
          "/courses/general",
          "Các khóa học General giúp bạn nâng cao kỹ năng tiếng Anh tổng quát cho công việc và cuộc sống.",
          "📖"
        )}
      </Container>

      <Footer />
    </>
  );
}
