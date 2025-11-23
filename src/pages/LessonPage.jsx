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
} from "@mui/material";

export default function LessonPage() {
    const navigate = useNavigate();
    const { courseId, lessonId } = useParams();

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [lessonId]);

    const course = mockCourses.find(
        (c) => c.courseId === parseInt(courseId, 10)
    );

    //  tìm bài học đúng trong khóa học
    const lesson = mockLessons.find(
        (l) =>
            l.lessonId === parseInt(lessonId, 10) &&
            l.courseId === parseInt(courseId, 10)
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

    // Các bài giảng trong cùng khóa
    const lessonsInCourse = mockLessons.filter(
        (l) => l.courseId === course.courseId
    );

    const prevLesson = lessonsInCourse.find(
        (l) => l.orderIndex === lesson.orderIndex - 1
    );
    const nextLesson = lessonsInCourse.find(
        (l) => l.orderIndex === lesson.orderIndex + 1
    );

    

    return (
        <>
            <Navbar />
            {/* Header */}
            <Box sx={{ backgroundColor: "#111", color: "white", py: 6 }}>
                <Container>
                    <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        flexWrap="wrap"
                    >
                        {/* Cột trái */}

                        <Box sx={{ flex: "1 1 55%", minWidth: 300 }}>
                            {/* Tiêu đề khóa học */}
                            <Typography variant="h4" fontWeight="bold" gutterBottom>
                                Khóa học: {course.title}
                            </Typography>

                            {/* 🔹 Chủ đề của khóa học (Level & Category) */}
                            <Box display="flex" gap={1.5} mb={2}>
                                {course.categories?.map((cat) => (
                                    <Button
                                        key={cat.name}
                                        variant="outlined"
                                        color="primary"
                                        size="small"
                                        sx={{
                                            borderRadius: 2,
                                            textTransform: "none",
                                            fontWeight: 600,
                                            borderColor: cat.description === "LEVEL" ? "#f3f1ff" : "#f7e8ff",
                                            color: cat.description === "LEVEL" ? "#f3f1ff" : "#f7e8ff",
                                            "&:hover": {
                                                backgroundColor:
                                                    cat.description === "LEVEL" ? "#4038d2ff" : "#73169aff",
                                            },
                                        }}
                                        onClick={() => navigate(`/courses/${cat.name.toLowerCase()}`)}
                                    >
                                        {cat.name}
                                    </Button>
                                ))}
                            </Box>


                            {/* Tiêu đề bài giảng */}
                            <Typography
                                variant="body1"
                                sx={{
                                    mb: 2,
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "normal",
                                }}
                            >
                                Bài giảng {lesson.orderIndex}: {lesson.title}
                            </Typography>

                            {/* Nút quay lại */}
                            <Button
                                variant="contained"
                                sx={{
                                    backgroundColor: "#1976d2",
                                    color: "white",
                                    textTransform: "none",
                                    fontWeight: "bold",
                                    borderRadius: 2,
                                    "&:hover": { backgroundColor: "#1259a7" },
                                }}
                                onClick={() => navigate(`/course/${course.courseId}`)}
                            >
                                Quay lại khóa học
                            </Button>
                        </Box>


                        {/* Cột phải: Thumbnail */}
                        <Box
                            component="img"
                            src={course.thumbnail}
                            alt={course.title}
                            sx={{
                                flex: "1 1 40%",
                                maxWidth: 320,
                                borderRadius: 3,
                                boxShadow: 3,
                                mt: { xs: 4, md: 0 },
                            }}
                        />
                    </Box>
                </Container>
            </Box>


            {/* Nội dung */}
            <Container sx={{ mt: 5, mb: 8 }}>
                {/* Video */}
                <Box
                    sx={{
                        position: "relative",
                        paddingTop: "50.625%",
                        borderRadius: 2,
                        boxShadow: 3,
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
                    ></iframe>
                </Box>

                {/* 📚 Tài liệu bài giảng */}
                <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mt: 6 }}>
                    Tài liệu bài giảng
                </Typography>

                {lesson.documentUrls && lesson.documentUrls.length > 0 ? (
                    <Box
                        display="grid"
                        gridTemplateColumns={{
                            xs: "1fr",
                            sm: "1fr 1fr",
                            md: "1fr 1fr 1fr",
                        }}
                        gap={2}
                    >
                        {lesson.documentUrls.map((url, index) => {
                            const fileName = url.split("/").pop();
                            const ext = fileName.split(".").pop().toLowerCase();

                            // 🎨 Gán màu & icon theo loại file
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
                                        px: 2,
                                        py: 1.5,
                                        borderRadius: 3,
                                        boxShadow: 2,
                                        transition: "all 0.3s ease",
                                        "&:hover": { transform: "scale(1.02)", boxShadow: 5 },
                                    }}
                                >
                                    {/* Icon */}
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: "50%",
                                            backgroundColor: file.bg,
                                            color: file.color,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: 26,
                                        }}
                                    >
                                        {file.icon}
                                    </Box>

                                    {/* Thông tin file */}
                                    <Box flexGrow={1}>
                                        <Typography
                                            variant="subtitle2"
                                            sx={{
                                                fontWeight: 600,
                                                wordBreak: "break-word",
                                            }}
                                        >
                                            {fileName}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {ext.toUpperCase()} file
                                        </Typography>
                                    </Box>

                                    {/* Nút tải / mở */}
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        sx={{
                                            textTransform: "none",
                                            borderColor: "black",
                                            color: "black",
                                            fontWeight: "bold",
                                            "&:hover": {
                                                backgroundColor: file.bg,
                                                borderColor: file.color,
                                            },
                                        }}
                                    >
                                        Mở
                                    </Button>
                                </Card>
                            );
                        })}
                    </Box>
                ) : (
                    <Typography variant="body2" color="text.secondary" mt={1}>
                        Chưa có tài liệu cho bài giảng này.
                    </Typography>
                )}



                {/* Nút Quiz */}
                <Box textAlign="center" mt={5}>
                    <Button
                        variant="contained"
                        color={mockQuizzes.some((q) => q.lessonId === lesson.lessonId) ? "secondary" : "grey"}
                        sx={{
                            px: 4,
                            py: 1.5,
                            borderRadius: 5,
                            fontWeight: "bold",
                            textTransform: "none",
                        }}
                        onClick={() => {
                            const relatedQuiz = mockQuizzes.find(
                                (q) => q.lessonId === lesson.lessonId
                            );
                            if (relatedQuiz) {
                                navigate(
                                    `/course/${course.courseId}/lesson/${lesson.lessonId}/quiz/${relatedQuiz.quizId}`
                                );
                            }
                        }}
                        disabled={!mockQuizzes.some((q) => q.lessonId === lesson.lessonId)}
                    >
                        {mockQuizzes.some((q) => q.lessonId === lesson.lessonId)
                            ? "LÀM BÀI QUIZ"
                            : "Bài giảng chưa có quiz"}
                    </Button>
                </Box>

                {/* Điều hướng bài giảng */}
            <Box display="flex" justifyContent="space-between" mt={6}>
                <Button
                    variant="outlined"
                    onClick={() =>
                        prevLesson &&
                        navigate(`/course/${course.courseId}/lesson/${prevLesson.lessonId}`)
                    }
                    disabled={!prevLesson}
                >
                    ← Bài trước
                </Button>

                <Button
                    variant="contained"
                    onClick={() =>
                        nextLesson &&
                        navigate(`/course/${course.courseId}/lesson/${nextLesson.lessonId}`)
                    }
                    disabled={!nextLesson}
                >
                    Bài tiếp theo →
                </Button>
            </Box>
            </Container>
            <Footer />
        </>
    );
}
