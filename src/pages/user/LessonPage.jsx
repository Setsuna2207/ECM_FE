import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { GetLessonById, GetLessonByCourseId } from "../../services/lessonService";
import { GetCourseById } from "../../services/courseService";
import { GetQuizById, GetAllQuizzes } from "../../services/quizService";
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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    CircularProgress,
} from "@mui/material";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import QuizIcon from "@mui/icons-material/Quiz";
import DescriptionIcon from "@mui/icons-material/Description";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import WarningIcon from "@mui/icons-material/Warning";

export default function LessonPage() {
    const navigate = useNavigate();
    const { courseId, lessonId } = useParams();
    const [previewOpen, setPreviewOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(true);
    const [previewError, setPreviewError] = useState(false);
    const [showBlur, setShowBlur] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [course, setCourse] = useState(null);
    const [lesson, setLesson] = useState(null);
    const [lessonsInCourse, setLessonsInCourse] = useState([]);
    const [hasQuiz, setHasQuiz] = useState(false);
    const [relatedQuiz, setRelatedQuiz] = useState(null);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        fetchData();
    }, [lessonId, courseId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch course, lesson, lessons in course, and quizzes in parallel
            const [courseRes, lessonRes, lessonsRes, quizzesRes] = await Promise.all([
                GetCourseById(courseId),
                GetLessonById(lessonId),
                GetLessonByCourseId(courseId),
                GetAllQuizzes(),
            ]);

            const courseData = courseRes.data;
            const lessonData = lessonRes.data;
            const lessonsData = lessonsRes.data || [];
            const quizzesData = quizzesRes.data || [];

            setCourse(courseData);
            setLesson(lessonData);
            setLessonsInCourse(lessonsData);

            // Check if lesson has quiz
            const quiz = quizzesData.find((q) => q.lessonID === parseInt(lessonId));
            setHasQuiz(!!quiz);
            setRelatedQuiz(quiz);

        } catch (err) {
            console.error("Error fetching lesson data:", err);
            setError("Không thể tải dữ liệu bài giảng");
        } finally {
            setLoading(false);
        }
    };

    // Reset preview state when dialog opens
    useEffect(() => {
        if (previewOpen) {
            setPreviewLoading(true);
            setPreviewError(false);
            setShowBlur(false);
        }
    }, [previewOpen]);

    // Cleanup scroll listener
    useEffect(() => {
        return () => {
            const dialogContent = document.querySelector('[role="dialog"] .MuiDialogContent-root');
            if (dialogContent) {
                dialogContent.removeEventListener('scroll', handlePreviewScroll);
            }
        };
    }, [showBlur]);

    const handleIframeLoad = () => {
        setPreviewLoading(false);
        // Start detecting scroll after a short delay
        setTimeout(() => {
            const dialogContent = document.querySelector('[role="dialog"] .MuiDialogContent-root');
            if (dialogContent) {
                dialogContent.addEventListener('scroll', handlePreviewScroll);
            }
        }, 100);
    };

    const handleIframeError = () => {
        setPreviewLoading(false);
        setPreviewError(true);
    };

    const handlePreviewScroll = (e) => {
        const scrollTop = e.target.scrollTop;
        // Show blur after scrolling down 100px
        if (scrollTop > 100 && !showBlur) {
            setShowBlur(true);
        }
    };

    // Check progress (from localStorage)
    const progressData = JSON.parse(localStorage.getItem("courseProgress")) || {};
    const isCompleted = progressData[String(courseId)]?.[String(lessonId)]?.completed;

    const prevLesson = lessonsInCourse.find((l) => l.orderIndex === lesson?.orderIndex - 1);
    const nextLesson = lessonsInCourse.find((l) => l.orderIndex === lesson?.orderIndex + 1);

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

    if (error || !course || !lesson) {
        return (
            <>
                <Navbar />
                <Container sx={{ mt: 6, mb: 6 }}>
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error || "Không tìm thấy bài giảng hoặc khóa học."}
                    </Alert>
                    <Button variant="contained" onClick={() => navigate("/courses")}>
                        Quay lại danh sách khóa học
                    </Button>
                </Container>
                <Footer />
            </>
        );
    }

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
                            onClick={() => navigate(`/course/${course.courseID || courseId}`)}
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
                                BÀI GIẢNG {lesson.orderIndex}
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
                </Paper>

                {/* Video Player */}
                <Paper
                    sx={{
                        position: "relative",
                        paddingTop: "56.25%",
                        borderRadius: 3,
                        boxShadow: 4,
                        overflow: "hidden",
                        mb: 4,
                    }}
                >
                    <video
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
                        controls
                        controlsList="nodownload"
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

                    {lesson.documentUrl && lesson.documentUrl.length > 0 ? (
                        <Box display="flex" flexDirection="column" gap={1}>
                            {lesson.documentUrl.map((url, index) => {
                                // Detect if it's a Google Drive URL
                                const isGoogleDrive = url.includes("docs.google.com") || url.includes("drive.google.com");

                                let fileName;
                                let ext;
                                let previewUrl = url;

                                if (isGoogleDrive) {
                                    // Extract file type from Google Drive URL
                                    if (url.includes("/presentation/")) {
                                        ext = "pptx";
                                        fileName = `Tài liệu ${index + 1}.pptx`;
                                    } else if (url.includes("/document/")) {
                                        ext = "docx";
                                        fileName = `Tài liệu ${index + 1}.docx`;
                                    } else if (url.includes("/spreadsheets/")) {
                                        ext = "xlsx";
                                        fileName = `Tài liệu ${index + 1}.xlsx`;
                                    } else {
                                        ext = "pdf";
                                        fileName = `Tài liệu ${index + 1}.pdf`;
                                    }

                                    // Extract the file ID from Google Drive URL
                                    const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
                                    if (fileIdMatch) {
                                        const fileId = fileIdMatch[1];
                                        // Convert to direct preview URL
                                        previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;
                                    }
                                } else {
                                    // Regular file URL
                                    fileName = url.split("/").pop();
                                    if (fileName.includes("?")) {
                                        fileName = fileName.split("?")[0];
                                    }
                                    ext = fileName.split(".").pop().toLowerCase();
                                }

                                const displayExt = ext;

                                const fileStyles = {
                                    pdf: { color: "#E53935", bg: "#FFEBEE", icon: "📕" },
                                    docx: { color: "#1E88E5", bg: "#E3F2FD", icon: "📘" },
                                    doc: { color: "#1E88E5", bg: "#E3F2FD", icon: "📘" },
                                    pptx: { color: "#FB8C00", bg: "#FFF3E0", icon: "📙" },
                                    ppt: { color: "#FB8C00", bg: "#FFF3E0", icon: "📙" },
                                    xlsx: { color: "#43A047", bg: "#E8F5E9", icon: "📗" },
                                    default: { color: "#6D4C41", bg: "#EFEBE9", icon: "📄" },
                                };

                                const file = fileStyles[displayExt] || fileStyles.default;

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
                                                {displayExt.toUpperCase()} • Tài liệu học tập
                                            </Typography>
                                        </Box>

                                        {/* Action Buttons */}
                                        <Box display="flex" gap={1}>
                                            <Button
                                                variant="outlined"
                                                size="large"
                                                startIcon={<VisibilityIcon />}
                                                onClick={() => {
                                                    setSelectedFile({ url: previewUrl, fileName, ext: displayExt, originalUrl: url });
                                                    setPreviewOpen(true);
                                                }}
                                                sx={{
                                                    textTransform: "none",
                                                    borderColor: file.color,
                                                    color: file.color,
                                                    borderRadius: 3,
                                                    fontWeight: 600,
                                                    fontSize: 14,
                                                    px: 2,
                                                    py: 0.7,
                                                    "&:hover": {
                                                        backgroundColor: file.bg,
                                                        borderColor: file.color,
                                                    },
                                                }}
                                            >
                                                Preview
                                            </Button>
                                            <Button
                                                variant="contained"
                                                size="large"
                                                startIcon={<DownloadIcon />}
                                                href={url}
                                                download
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                sx={{
                                                    textTransform: "none",
                                                    backgroundColor: file.color,
                                                    borderRadius: 3,
                                                    fontWeight: 600,
                                                    fontSize: 14,
                                                    px: 2,
                                                    py: 0.7,
                                                    "&:hover": { backgroundColor: file.color, opacity: 0.9 },
                                                }}
                                            >
                                                Download
                                            </Button>
                                        </Box>
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
                        onClick={() => relatedQuiz && navigate(`/course/${courseId}/lesson/${lessonId}/quiz/${relatedQuiz.quizID}`)}
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
                            onClick={() => navigate(`/course/${course.courseID || courseId}`)}
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
                                onClick={() => prevLesson && navigate(`/course/${courseId}/lesson/${prevLesson.lessonID}`)}
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
                                onClick={() => nextLesson && navigate(`/course/${courseId}/lesson/${nextLesson.lessonID}`)}
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

            {/* File Preview Modal */}
            <Dialog
                open={previewOpen}
                onClose={() => setPreviewOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        height: "90vh",
                        maxHeight: "90vh",
                        aspectRatio: "1/1",
                        borderRadius: 3,
                        m: 2,
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 700, fontSize: 20, pb: 1.5, display: "flex", alignItems: "center", gap: 2 }}>
                    <Box display="flex" alignItems="center" gap={1} flex={1}>
                        <DescriptionIcon color="primary" />
                        <Typography variant="h6" fontWeight={700}>
                            Xem trước: {selectedFile?.fileName}
                        </Typography>
                    </Box>
                    {selectedFile?.ext === "pdf" && (
                        <Chip
                            size="small"
                            color="info"
                            sx={{ fontWeight: 600 }}
                        />
                    )}
                </DialogTitle>
                <Divider />
                <DialogContent sx={{ p: 0, position: "relative", overflow: "auto" }}>
                    {selectedFile && (
                        <Box sx={{ width: "100%", height: "100%", position: "relative" }}>
                            {/* Blur Overlay for Bottom Half - Only shows after scrolling */}
                            <Box
                                sx={{
                                    position: "absolute",
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    height: "50%",
                                    background: "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.95) 100%)",
                                    backdropFilter: "blur(8px)",
                                    zIndex: 5,
                                    pointerEvents: "none",
                                    display: (previewLoading || previewError || !showBlur) ? "none" : "block",
                                    opacity: showBlur ? 1 : 0,
                                    transition: "opacity 0.5s ease-in-out",
                                }}
                            />

                            {/* Download Prompt Overlay - Only shows after scrolling */}
                            <Box
                                sx={{
                                    position: "absolute",
                                    bottom: "15%",
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    zIndex: 6,
                                    textAlign: "center",
                                    display: (previewLoading || previewError || !showBlur) ? "none" : "flex",
                                    flexDirection: "column",
                                    gap: 2,
                                    alignItems: "center",
                                    opacity: showBlur ? 1 : 0,
                                    transition: "opacity 0.5s ease-in-out",
                                }}
                            >
                                <Typography variant="h6" fontWeight={700} color="text.primary">
                                    📥 Tải xuống để xem toàn bộ tài liệu
                                </Typography>
                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={<DownloadIcon />}
                                    href={selectedFile?.url}
                                    download
                                    sx={{
                                        borderRadius: 3,
                                        textTransform: "none",
                                        fontWeight: 700,
                                        fontSize: 16,
                                        px: 4,
                                        py: 1.5,
                                        backgroundColor: "#4038d2ff",
                                        boxShadow: 3,
                                        "&:hover": {
                                            backgroundColor: "#73169aff",
                                            boxShadow: 6,
                                        },
                                    }}
                                >
                                    Tải xuống ngay
                                </Button>
                            </Box>

                            {/* Loading Indicator */}
                            {previewLoading && (
                                <Box
                                    sx={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        backgroundColor: "#f5f5f5",
                                        zIndex: 10,
                                        gap: 2,
                                    }}
                                >
                                    <CircularProgress size={60} />
                                    <Typography variant="h6" color="text.secondary">
                                        Đang tải tài liệu...
                                    </Typography>
                                </Box>
                            )}

                            {/* Error State */}
                            {previewError && (
                                <Box
                                    sx={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        backgroundColor: "#f5f5f5",
                                        zIndex: 10,
                                        gap: 2,
                                        p: 4,
                                    }}
                                >
                                    <WarningIcon sx={{ fontSize: 60, color: "#f57c00" }} />
                                    <Typography variant="h6" color="text.secondary" textAlign="center">
                                        Không thể tải preview
                                    </Typography>
                                    <Alert severity="warning" sx={{ maxWidth: 600 }}>
                                        Tài liệu có thể cần quyền truy cập đặc biệt hoặc không hỗ trợ xem trước trực tuyến.
                                        Vui lòng tải xuống để xem toàn bộ tài liệu.
                                    </Alert>
                                </Box>
                            )}

                            {/* PDF Preview */}
                            {selectedFile.ext === "pdf" && (
                                <iframe
                                    src={selectedFile.url.includes("drive.google.com")
                                        ? selectedFile.url
                                        : `${selectedFile.url}#page=1&view=FitH&toolbar=0&navpanes=0&scrollbar=0`}
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        border: "none",
                                        display: previewLoading || previewError ? "none" : "block",
                                    }}
                                    title={selectedFile.fileName}
                                    onLoad={handleIframeLoad}
                                    onError={handleIframeError}
                                />
                            )}

                            {/* Word Document Preview */}
                            {(selectedFile.ext === "docx" || selectedFile.ext === "doc") && (
                                <Box sx={{ width: "100%", height: "100%" }}>
                                    <iframe
                                        src={selectedFile.url}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            border: "none",
                                            display: previewLoading || previewError ? "none" : "block",
                                        }}
                                        title={selectedFile.fileName}
                                        onLoad={handleIframeLoad}
                                        onError={handleIframeError}
                                    />
                                </Box>
                            )}

                            {/* PowerPoint Preview */}
                            {(selectedFile.ext === "pptx" || selectedFile.ext === "ppt") && (
                                <Box sx={{ width: "100%", height: "100%" }}>
                                    <iframe
                                        src={selectedFile.url}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            border: "none",
                                            display: previewLoading || previewError ? "none" : "block",
                                        }}
                                        title={selectedFile.fileName}
                                        onLoad={handleIframeLoad}
                                        onError={handleIframeError}
                                    />
                                </Box>
                            )}

                            {/* Unsupported file types */}
                            {!["pdf", "docx", "doc", "pptx", "ppt"].includes(selectedFile.ext) && (
                                <Box
                                    sx={{
                                        width: "100%",
                                        height: "100%",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        backgroundColor: "#f5f5f5",
                                        gap: 2,
                                    }}
                                >
                                    <DescriptionIcon sx={{ fontSize: 60, color: "#6D4C41" }} />
                                    <Typography variant="h6" color="text.secondary">
                                        File Preview không có sẵn
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Định dạng {selectedFile.ext.toUpperCase()} không hỗ trợ xem trước
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Vui lòng tải xuống để xem tài liệu
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <Divider />
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button
                        variant="outlined"
                        onClick={() => setPreviewOpen(false)}
                        sx={{
                            borderRadius: 2,
                            textTransform: "none",
                            fontWeight: 600,
                            px: 3,
                        }}
                    >
                        Đóng
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        href={selectedFile?.url}
                        download
                        sx={{
                            borderRadius: 2,
                            textTransform: "none",
                            fontWeight: 600,
                            px: 3,
                            backgroundColor: "#4038d2ff",
                            "&:hover": { backgroundColor: "#73169aff" },
                        }}
                    >
                        Tải xuống
                    </Button>
                </DialogActions>
            </Dialog>

            <Footer />
        </>
    );
}