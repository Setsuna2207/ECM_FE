import { useParams, useNavigate } from "react-router-dom";
import { mockLessons } from "../data/mockLesson";
import { mockCourses } from "../data/mockCourse";
import { mockQuizzes } from "../data/mockQuiz";
import { useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
    Container,
    Typography,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Paper,
    Divider,
    Grid,
} from "@mui/material";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import QuizIcon from "@mui/icons-material/Quiz";
import DescriptionIcon from "@mui/icons-material/Description";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function LessonPage() {
    const navigate = useNavigate();
    const { courseId, lessonId } = useParams();

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [lessonId]);

    const course = mockCourses.find((c) => c.courseId === parseInt(courseId, 10));
    const lesson = mockLessons.find(
        (l) => l.lessonId === parseInt(lessonId, 10) && l.courseId === parseInt(courseId, 10)
    );

    if (!course || !lesson) {
        return (
            <>
                <Navbar />
                <Container sx={{ mt: 6, mb: 6 }}>
                    <Typography variant="h5" textAlign="center">
                        Không tìm thấy bài giảng hoặc khóa học.
                    </Typography>
                </Container>
                <Footer />
            </>
        );
    }

    const lessonsInCourse = mockLessons.filter((l) => l.courseId === course.courseId);
    const prevLesson = lessonsInCourse.find((l) => l.orderIndex === lesson.orderIndex - 1);
    const nextLesson = lessonsInCourse.find((l) => l.orderIndex === lesson.orderIndex + 1);

    // Check if lesson has quiz
    const hasQuiz = mockQuizzes.some((q) => q.lessonId === lesson.lessonId);
    const relatedQuiz = mockQuizzes.find((q) => q.lessonId === lesson.lessonId);

    // Check progress (from localStorage)
    const progressData = JSON.parse(localStorage.getItem("courseProgress")) || {};
    const isCompleted = progressData[String(courseId)]?.[String(lessonId)]?.completed;

    return (
        <>
            <Navbar />

            {/* Breadcrumb Header */}
            <Box sx={{ backgroundColor: "#f5f5f5", py: 2, borderBottom: "1px solid #e0e0e0" }}>
                <Container>
                    <Box display="flex" alignItems="center" gap={1}>
                        <Button
                            size="small"
                            startIcon={<ArrowBackIcon />}
                            onClick={() => navigate(`/course/${course.courseId}`)}
                            sx={{ textTransform: "none", color: "#666" }}
                        >
                            {course.title}
                        </Button>
                        <Typography color="text.secondary">/</Typography>
                        <Typography variant="body2" fontWeight={600}>
                            Bài {lesson.orderIndex}: {lesson.title}
                        </Typography>
                    </Box>
                </Container>
            </Box>

            {/* Main Content */}
            <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
                {/* Lesson Header */}
                <Paper sx={{ p: 4, mb: 4, borderRadius: 3, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}>
                    <Box display="flex" alignItems="center" gap={3} mb={2}>
                        <PlayCircleOutlineIcon sx={{ fontSize: 50 }} />
                        <Box flex={1}>
                            <Typography variant="h6" sx={{ opacity: 0.9, mb: 0.5 }}>
                                BÀI HỌC {lesson.orderIndex}
                            </Typography>
                            <Typography variant="h4" fontWeight="700">
                                {lesson.title}
                            </Typography>
                        </Box>
                        {isCompleted && (
                            <Chip
                                icon={<CheckCircleIcon />}
                                label="Đã hoàn thành"
                                size="large"
                                sx={{ backgroundColor: "#4caf50", color: "white", px: 2, py: 3, fontSize: 16 }}
                            />
                        )}
                    </Box>

                    {/* Categories */}
                    <Box display="flex" gap={1.5} flexWrap="wrap">
                        {course.categories?.map((cat) => (
                            <Chip
                                key={cat.name}
                                label={cat.name}
                                onClick={() => navigate(`/courses/${cat.name.toLowerCase()}`)}
                                sx={{
                                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                                    color: "white",
                                    fontWeight: 600,
                                    fontSize: 15,
                                    px: 2,
                                    py: 2.5,
                                    "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.3)" }
                                }}
                            />
                        ))}
                    </Box>
                </Paper>

                {/* Video Player */}
                <Paper
                    sx={{
                        position: "relative",
                        paddingTop: "56.25%" 
                        , borderRadius: 3,
                        boxShadow: 4,
                        overflow: "hidden",
                        mb: 4,
                    }}
                >
                    <iframe
                        src={lesson.videoUrl}
                        title={lesson.title}
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            border: 0,
                        }}
                        allowFullScreen
                    />
                </Paper>

                {/* Documents Section */}
                <Paper sx={{ p: 4, borderRadius: 3, mb: 4 }}> 
                    <Box display="flex" alignItems="center" gap={2} mb={1}>
                        <DescriptionIcon color="primary" sx={{ fontSize: 26 }} />
                        <Typography variant="h6" fontWeight="700">
                            Tài liệu bài giảng
                        </Typography>
                    </Box>

                    <Divider sx={{ mb: 1 }} />

                    {lesson.documentUrls && lesson.documentUrls.length > 0 ? (
                        <Box display="flex" flexDirection="column" gap={1}>
                            {lesson.documentUrls.map((url, index) => {
                                const fileName = url.split("/").pop();
                                const ext = fileName.split(".").pop().toLowerCase();

                                const fileStyles = {
                                    pdf: { color: "#E53935", bg: "#FFEBEE", icon: "📕" },
                                    docx: { color: "#1E88E5", bg: "#E3F2FD", icon: "📘" },
                                    pptx: { color: "#FB8C00", bg: "#FFF3E0", icon: "📙" },
                                    xlsx: { color: "#43A047", bg: "#E8F5E9", icon: "📗" },
                                    default: { color: "#6D4C41", bg: "#EFEBE9", icon: "📄" },
                                };

                                const file = fileStyles[ext] || fileStyles.default;

                                return (
                                    <Card
                                        key={index}
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 2,
                                            p: 2,
                                            borderRadius: 3,
                                            border: "2px solid #e0e0e0",
                                            transition: "all 0.3s ease",
                                            "&:hover": {
                                                transform: "translateX(5px)",
                                                boxShadow: 4,
                                                borderColor: file.color,
                                            },
                                        }}
                                    >
                                        {/* Icon */}
                                        <Box
                                            sx={{
                                                width: 60,
                                                height: 60,
                                                borderRadius: 2,
                                                backgroundColor: file.bg,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: 30,
                                            }}
                                        >
                                            {file.icon}
                                        </Box>

                                        {/* File Info */}
                                        <Box flex={1}>
                                            <Typography variant="h6" fontWeight={600} sx={{ wordBreak: "break-word", mb: 0.5 }}>
                                                {fileName}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {ext.toUpperCase()} • Tài liệu học tập
                                            </Typography>
                                        </Box>

                                        {/* Action Button */}
                                        <Button
                                            variant="contained"
                                            size="large"
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            sx={{
                                                textTransform: "none",
                                                backgroundColor: file.color,
                                                borderRadius: 3,
                                                fontWeight: 600,
                                                fontSize: 16,
                                                px: 3,
                                                py: 0.7,
                                                "&:hover": { backgroundColor: file.color, opacity: 0.9 },
                                            }}
                                        >
                                            Mở file
                                        </Button>
                                    </Card>
                                );
                            })}
                        </Box>
                    ) : (
                        <Box textAlign="center" py={6}>
                            <Typography variant="h6" color="text.secondary">
                                📚 Chưa có tài liệu cho bài giảng này
                            </Typography>
                        </Box>
                    )}
                </Paper>

                {/* Quiz Section */}
                <Paper
                    sx={{
                        p: 3,
                        borderRadius: 3,
                        mb: 4,
                        background: hasQuiz
                            ? "linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)"
                            : "#f5f5f5",
                        border: hasQuiz ? "3px solid #fdcb6e" : "3px solid #e0e0e0",
                    }}
                >
                    <Box display="flex" alignItems="center" gap={3} mb={3}>
                        <Box
                            sx={{
                                width: 60,
                                height: 60,
                                borderRadius: 3,
                                backgroundColor: hasQuiz ? "#ff9f43" : "#ccc",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <QuizIcon sx={{ fontSize: 36, color: "white" }} />
                        </Box>

                        <Box flex={1}>
                            <Typography variant="h5" fontWeight="700" mb={1}>
                                {hasQuiz ? "Quiz" : "Chưa có quiz"}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                {hasQuiz
                                    ? "Hoàn thành quiz để kiểm tra kiến thức của bạn"
                                    : "Bài giảng này chưa có bài quiz"}
                            </Typography>
                        </Box>
                    </Box>

                    <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={!hasQuiz}
                        onClick={() => relatedQuiz && navigate(`/course/${courseId}/lesson/${lessonId}/quiz/${relatedQuiz.quizId}`)}
                        sx={{
                            py: 2,
                            borderRadius: 4,
                            fontWeight: 700,
                            fontSize: 18,
                            textTransform: "none",
                            backgroundColor: hasQuiz ? "#4038d2ff" : "#ccc",
                            "&:hover": { backgroundColor: hasQuiz ? "#73169aff" : "#ccc" },
                        }}
                    >
                        Làm bài Quiz
                    </Button>
                </Paper>

                {/* Progress & Navigation Row */}
                <Box display="flex" gap={3} mb={4} flexWrap="wrap">
                    {/* Progress Card */}
                    <Paper sx={{ flex: 1, minWidth: 280, p: 4, borderRadius: 3, backgroundColor: "#ffffffff" }}>
                        <Typography variant="h6" fontWeight="700" mb={1}>
                            📊 Tiến độ học tập
                        </Typography>
                        <Divider sx={{ mb: 1 }} />
                        <Box display="flex" alignItems="center" gap={2} mb={1}>
                            <Typography variant="h2" fontWeight="bold" color="primary">
                                {lesson.orderIndex}
                            </Typography>
                            <Typography variant="h6" color="text.secondary">
                                / {lessonsInCourse.length} bài học
                            </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                            Bạn đang ở bài học thứ {lesson.orderIndex} trong khóa học này.
                            Bài học được coi là hoàn thành và cập nhật vào lịch sử học tập 
                            sau khi bạn hoàn thành quiz (nếu có).
                        </Typography>
                    </Paper>

                    {/* Navigation Card */}
                    <Paper sx={{ flex: 1, minWidth: 280, p: 4, borderRadius: 3 }}>
                        <Typography variant="h6" fontWeight="700" mb={1}>
                            🧭 Điều hướng
                        </Typography>
                        <Divider sx={{ mb: 1 }} />
                        {/* Return to Course */}
                        <Button
                            fullWidth
                            variant="outlined"
                            size="large"
                            startIcon={<ArrowBackIcon />}
                            onClick={() => navigate(`/course/${course.courseId}`)}
                            sx={{
                                mb: 2,
                                py: 1.5,
                                borderRadius: 2,
                                textTransform: "none",
                                fontWeight: 600,
                                fontSize: 16,
                                borderColor: "#4038d2ff",
                                color: "#4038d2ff",
                                "&:hover": {
                                    backgroundColor: "#f3f2ff",
                                    borderColor: "#4038d2ff",
                                }
                            }}
                        >
                            Quay lại khóa học
                        </Button>

                        {/* Previous/Next buttons side by side */}
                        <Box display="flex" gap={2}>
                            <Button
                                fullWidth
                                variant="outlined"
                                size="large"
                                startIcon={<ArrowBackIcon />}
                                onClick={() => prevLesson && navigate(`/course/${courseId}/lesson/${prevLesson.lessonId}`)}
                                disabled={!prevLesson}
                                sx={{
                                    py: 1.5,
                                    borderRadius: 2,
                                    textTransform: "none",
                                    fontWeight: 600,
                                    fontSize: 14,
                                }}
                            >
                                Bài trước
                            </Button>

                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                endIcon={<ArrowForwardIcon />}
                                onClick={() => nextLesson && navigate(`/course/${courseId}/lesson/${nextLesson.lessonId}`)}
                                disabled={!nextLesson}
                                sx={{
                                    py: 1.5,
                                    borderRadius: 2,
                                    textTransform: "none",
                                    fontWeight: 600,
                                    fontSize: 14,
                                    backgroundColor: "#4038d2ff",
                                    "&:hover": { backgroundColor: "#73169aff" },
                                }}
                            >
                                Bài tiếp
                            </Button>
                        </Box>
                    </Paper>
                </Box>
            </Container>

            <Footer />
        </>
    );
}