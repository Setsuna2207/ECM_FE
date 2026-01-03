import { Grid, Container, Typography, Button, Box, Chip, Avatar, CircularProgress, Alert, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import CourseCard from "../../components/CourseCard";
import RcmCourseCard from "../../components/RcmCourseCard";
import { GetAllCourses, GetCourseById } from "../../services/courseService";
import { recommendCourse } from "../../services/aiService";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import FiberNewIcon from "@mui/icons-material/FiberNew";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import QuizIcon from "@mui/icons-material/Quiz";

export default function HomePage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [aiRecommendedCourses, setAiRecommendedCourses] = useState([]);
  const [displayedAiCourses, setDisplayedAiCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get user info
    const user = JSON.parse(localStorage.getItem("currentUser"));
    setCurrentUser(user);

    // Fetch courses first, then AI recommendations
    const loadData = async () => {
      await fetchCourses();
      if (user) {
        fetchAIRecommendations();
      }
    };

    loadData();
  }, []);

  const fetchAIRecommendations = async () => {
    try {
      console.log("=== FETCHING AI RECOMMENDATIONS ===");

      // Get user-specific cache key
      const user = JSON.parse(localStorage.getItem("currentUser"));
      const userId = user?.userID || user?.userId;
      const cacheKey = `aiRecommendations_${userId}`;

      // Try to get cached recommendations first
      const cachedRecs = localStorage.getItem(cacheKey);
      if (cachedRecs) {
        try {
          const parsed = JSON.parse(cachedRecs);
          console.log("Found cached recommendations for user:", userId, parsed.length);
          setAiRecommendedCourses(parsed);
        } catch (e) {
          console.error("Error parsing cached recommendations:", e);
        }
      }

      const response = await recommendCourse();
      console.log("AI Response full:", response);
      console.log("AI Response data:", response.data);
      console.log("AI Response data type:", typeof response.data);

      if (response.data) {
        console.log("AI Response data keys:", Object.keys(response.data));
        console.log("AI Response data stringified:", JSON.stringify(response.data, null, 2));
      }

      if (response.data && response.data.recommendations) {
        console.log("Recommendations found:", response.data.recommendations.length);
        console.log("Recommendations:", response.data.recommendations);
        setAiRecommendedCourses(response.data.recommendations);

        // Cache recommendations in localStorage with user-specific key
        localStorage.setItem(cacheKey, JSON.stringify(response.data.recommendations));
      } else if (response.data && Array.isArray(response.data)) {
        console.log("Response is array:", response.data.length);
        setAiRecommendedCourses(response.data);
        localStorage.setItem(cacheKey, JSON.stringify(response.data));
      } else {
        console.log("No recommendations in response");
        // Keep cached recommendations if API returns empty
        if (!cachedRecs) {
          setAiRecommendedCourses([]);
        }
      }
    } catch (err) {
      console.error("Error fetching AI recommendations:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);

      // Get user-specific cache key
      const user = JSON.parse(localStorage.getItem("currentUser"));
      const userId = user?.userID || user?.userId;
      const cacheKey = `aiRecommendations_${userId}`;

      // Check if it's because user hasn't taken test or set goal
      if (err.response?.status === 404 || err.response?.status === 400) {
        console.log("User needs to set goal and take test first");
        localStorage.removeItem(cacheKey);
        setAiRecommendedCourses([]);
      } else {
        // Try to use cached recommendations on error
        const cachedRecs = localStorage.getItem(cacheKey);
        if (cachedRecs) {
          try {
            const parsed = JSON.parse(cachedRecs);
            console.log("Using cached recommendations due to error:", parsed.length);
            setAiRecommendedCourses(parsed);
          } catch (e) {
            setAiRecommendedCourses([]);
          }
        } else {
          setAiRecommendedCourses([]);
        }
      }
    }
  };

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

  // Map AI recommendations to full course details whenever courses or recommendations change
  // Fetch full course details for each AI recommendation
  useEffect(() => {
    const fetchRecommendedCourses = async () => {
      if (aiRecommendedCourses.length > 0) {
        console.log("=== FETCHING RECOMMENDED COURSES ===");
        console.log("AI recommendations:", aiRecommendedCourses);
        console.log("Number of recommendations:", aiRecommendedCourses.length);

        const coursePromises = aiRecommendedCourses.map(async (aiCourse, index) => {
          // Try all possible property name variations
          const courseId = aiCourse.courseId || aiCourse.CourseId || aiCourse.CourseID || aiCourse.courseID;
          console.log(`[${index + 1}] AI Course object:`, aiCourse);
          console.log(`[${index + 1}] Extracted courseId:`, courseId);

          if (!courseId) {
            console.error(`[${index + 1}] ✗ No courseId found in AI recommendation:`, aiCourse);
            return null;
          }

          try {
            const response = await GetCourseById(courseId);
            const courseData = response.data;

            // Normalize property names
            const normalizedCourse = {
              courseId: courseData.CourseID || courseData.courseId || courseId,
              title: courseData.Title || courseData.title,
              description: courseData.Description || courseData.description,
              thumbnailUrl: courseData.ThumbnailUrl || courseData.thumbnailUrl,
              createdAt: courseData.CreatedAt || courseData.createdAt,
              totalLessons: courseData.TotalLessons || courseData.totalLessons || 0,
              totalReviews: courseData.TotalReviews || courseData.totalReviews || 0,
              rating: courseData.AverageRating || courseData.averageRating || 0,
              categories: courseData.Categories || courseData.categories || [],
              aiReason: aiCourse.reason || aiCourse.Reason,
              aiPriority: index + 1
            };

            console.log(`[${index + 1}] ✓ Fetched course:`, normalizedCourse.title, `(ID: ${normalizedCourse.courseId})`);
            return normalizedCourse;
          } catch (err) {
            console.error(`[${index + 1}] ✗ Error fetching course ${courseId}:`, err);
            return null;
          }
        });

        const fetchedCourses = await Promise.all(coursePromises);
        const validCourses = fetchedCourses.filter(c => c !== null);

        console.log("Successfully fetched courses:", validCourses.length);
        console.log("Valid courses:", validCourses);
        setDisplayedAiCourses(validCourses);
      } else {
        console.log("No AI recommendations to fetch");
        setDisplayedAiCourses([]);
      }
    };

    fetchRecommendedCourses();
  }, [aiRecommendedCourses]);

  // New Courses - Sort by createdAt (newest first), max 3
  const newCourses = [...courses]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

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
    if (!currentUser) return null;

    // Show message if user hasn't taken test yet
    if (displayedAiCourses.length === 0) {
      return (
        <Box sx={{ mb: 6 }}>
          <Paper
            sx={{
              p: 4,
              borderRadius: 4,
              background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
              border: "2px solid #bae6fd",
              textAlign: "center",
            }}
          >
            <AutoAwesomeIcon
              sx={{
                fontSize: 60,
                color: "#0284c7",
                mb: 2,
                animation: "pulse 2s infinite",
                "@keyframes pulse": {
                  "0%, 100%": { opacity: 1 },
                  "50%": { opacity: 0.5 },
                },
              }}
            />
            <Typography variant="h5" fontWeight="bold" color="#0c4a6e" mb={2}>
              Chưa có gợi ý khóa học từ AI
            </Typography>
            <Typography variant="body1" color="#0369a1" mb={1}>
              Để nhận được gợi ý khóa học phù hợp, bạn cần:
            </Typography>
            <Box sx={{ textAlign: "left", maxWidth: 500, mx: "auto", mb: 3 }}>
              <Typography variant="body2" color="#0369a1" sx={{ mb: 1 }}>
                1️⃣ Thiết lập mục tiêu học tập trong trang cá nhân
              </Typography>
              <Typography variant="body2" color="#0369a1" sx={{ mb: 1 }}>
                2️⃣ Làm bài kiểm tra đầu vào để AI đánh giá trình độ
              </Typography>
              <Typography variant="body2" color="#0369a1">
                3️⃣ AI sẽ tự động đề xuất khóa học phù hợp với bạn
              </Typography>
            </Box>
            <Box display="flex" gap={2} justifyContent="center">
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate("/profile")}
                sx={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  textTransform: "none",
                  fontWeight: "bold",
                  px: 3,
                  py: 1.5,
                  borderRadius: 2.5,
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 16px rgba(102, 126, 234, 0.4)",
                  },
                }}
              >
                Thiết lập mục tiêu
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<QuizIcon />}
                onClick={() => navigate("/tests")}
                sx={{
                  textTransform: "none",
                  fontWeight: "bold",
                  px: 3,
                  py: 1.5,
                  borderRadius: 2.5,
                }}
              >
                Làm bài kiểm tra
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }

    return (
      <Box sx={{ mb: 6 }}>
        <Box
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: 4,
            p: 4,
            mb: 3,
            color: "white",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(102, 126, 234, 0.3)",
            "&::before": {
              content: '""',
              position: "absolute",
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              background: "rgba(255,255,255,0.1)",
              borderRadius: "50%",
            },
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: -30,
              left: -30,
              width: 150,
              height: 150,
              background: "rgba(255,255,255,0.05)",
              borderRadius: "50%",
            },
          }}
        >
          <Box display="flex" alignItems="center" gap={2} mb={2} position="relative" zIndex={1}>
            <Box
              sx={{
                background: "rgba(255,255,255,0.2)",
                borderRadius: 3,
                p: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(10px)",
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
            </Box>
            <Box flex={1}>
              <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5 }}>
                Gợi ý dành riêng cho bạn
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.95 }}>
                Dựa trên kết quả kiểm tra và mục tiêu học tập của bạn
              </Typography>
            </Box>
            <Box display="flex" gap={1}>
              <Chip
                icon={<AutoAwesomeIcon sx={{ color: "white !important" }} />}
                label="AI Powered"
                sx={{
                  backgroundColor: "rgba(255,255,255,0.25)",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "0.875rem",
                  px: 2,
                  py: 2.5,
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.3)",
                }}
              />
            </Box>
          </Box>
          <Typography variant="body2" sx={{ opacity: 0.9, position: "relative", zIndex: 1 }}>
            💡 Các khóa học được AI đề xuất dựa trên kết quả kiểm tra và mục tiêu của bạn
          </Typography>
        </Box>

        <Grid container spacing={3} justifyContent={"center"}>
          {displayedAiCourses.map((course, index) => (
            <Grid item key={course.courseId} xs={12} sm={6} md={4}>
              <Box
                sx={{
                  animation: "fadeInUp 0.5s ease-out",
                  animationDelay: `${index * 0.1}s`,
                  animationFillMode: "both",
                  "@keyframes fadeInUp": {
                    from: {
                      opacity: 0,
                      transform: "translateY(20px)",
                    },
                    to: {
                      opacity: 1,
                      transform: "translateY(0)",
                    },
                  },
                }}
              >
                <RcmCourseCard course={course} />
              </Box>
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

        <Grid container spacing={3} justifyContent={"center"}>
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
      .slice(0, 3);

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

        <Grid container spacing={3} justifyContent={"center"}>
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
            <Button
              variant="contained"
              startIcon={<QuizIcon />}
              onClick={() => navigate("/test-rcm")}
              sx={{
                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                textTransform: "none",
                fontWeight: "bold",
                borderRadius: 2.5,
                px: 3,
                py: 1.5,
                boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)",
                "&:hover": {
                  background: "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 16px rgba(245, 158, 11, 0.4)",
                },
              }}
            >
              Gợi ý bài test
            </Button>
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
