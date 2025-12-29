import { useState, useEffect } from "react";
import {
    Container,
    Typography,
    Box,
    Paper,
    Grid,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Alert,
    Stack,
    Pagination,
    LinearProgress,
} from "@mui/material";
import {
    CheckCircle,
    Quiz as QuizIcon,
    CalendarToday,
    TrendingUp,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { GetTestResultsByUserId } from "../../services/testResultService";
import { GetPlacementTestById } from "../../services/placementTestService";

export default function TestResultPage() {
    const navigate = useNavigate();
    const [testResults, setTestResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);
    const resultsPerPage = 6;

    useEffect(() => {
        fetchTestResults();
    }, []);

    const fetchTestResults = async () => {
        try {
            setLoading(true);
            setError("");

            const currentUser = JSON.parse(localStorage.getItem("currentUser"));
            const token = localStorage.getItem("access_token");

            console.log("=== FETCHING TEST RESULTS ===");
            console.log("Current user:", currentUser);
            console.log("Current user keys:", currentUser ? Object.keys(currentUser) : "null");
            console.log("Current user stringified:", JSON.stringify(currentUser));
            console.log("Token exists:", !!token);
            console.log("Token preview:", token ? token.substring(0, 50) + "..." : "NO TOKEN");

            if (!currentUser || !token) {
                console.error("Missing user or token, redirecting to login");
                navigate("/login");
                return;
            }

            // Handle both userID and userId (backend uses userID)
            const userId = currentUser.userID || currentUser.userId || currentUser.UserId || currentUser.userid;
            console.log("User ID:", userId);
            console.log("Checking properties: userID=", currentUser.userID, "userId=", currentUser.userId, "UserId=", currentUser.UserId);

            if (!userId) {
                console.error("No userId found in currentUser object!");
                console.error("Available keys:", Object.keys(currentUser));
                console.error("Full currentUser object:", currentUser);
                setError("Không tìm thấy thông tin người dùng");
                setLoading(false);
                return;
            }

            console.log("Calling GetTestResultsByUserId with userId:", userId);

            // Get test results for current user
            const response = await GetTestResultsByUserId(userId);
            const results = response.data;

            console.log("Test results received successfully:", results);

            // Fetch placement test details for each result
            const enrichedResults = await Promise.all(
                results.map(async (result) => {
                    try {
                        // Normalize property names
                        const normalizedResult = {
                            resultId: result.ResultID || result.resultId,
                            testId: result.TestID || result.testId,
                            userId: result.UserID || result.userId,
                            userAnswers: result.UserAnswers || result.userAnswers,
                            correctAnswers: result.CorrectAnswers || result.correctAnswers,
                            incorrectAnswers: result.IncorrectAnswers || result.incorrectAnswers,
                            skippedAnswers: result.SkippedAnswers || result.skippedAnswers,
                            overallScore: result.OverallScore || result.overallScore,
                            sectionScores: result.SectionScores || result.sectionScores,
                            levelDetected: result.LevelDetected || result.levelDetected,
                            timeSpent: result.TimeSpent || result.timeSpent,
                            createdAt: result.CreatedAt || result.createdAt,
                        };

                        // Get placement test details
                        const testResponse = await GetPlacementTestById(normalizedResult.testId);
                        const test = testResponse.data;

                        return {
                            ...normalizedResult,
                            testTitle: test.Title || test.title || "Placement Test",
                            testDescription: test.Description || test.description || "",
                            testThumbnail: test.ThumbnailUrl || test.thumbnailUrl || "",
                            totalQuestions: normalizedResult.correctAnswers + normalizedResult.incorrectAnswers + normalizedResult.skippedAnswers,
                        };
                    } catch (err) {
                        console.error("Error fetching details for result:", result, err);
                        const total = (result.CorrectAnswers || 0) + (result.IncorrectAnswers || 0) + (result.SkippedAnswers || 0);
                        return {
                            resultId: result.ResultID || result.resultId,
                            testId: result.TestID || result.testId,
                            correctAnswers: result.CorrectAnswers || result.correctAnswers,
                            incorrectAnswers: result.IncorrectAnswers || result.incorrectAnswers,
                            skippedAnswers: result.SkippedAnswers || result.skippedAnswers,
                            overallScore: result.OverallScore || result.overallScore,
                            levelDetected: result.LevelDetected || result.levelDetected,
                            timeSpent: result.TimeSpent || result.timeSpent,
                            createdAt: result.CreatedAt || result.createdAt,
                            testTitle: "Placement Test",
                            testDescription: "",
                            totalQuestions: total,
                        };
                    }
                })
            );

            setTestResults(enrichedResults);
        } catch (err) {
            console.error("Error fetching test results:", err);
            console.error("Error response:", err.response);

            // Check if it's an authentication error
            if (err.response?.status === 401) {
                console.error("Authentication error - token may have expired");
                setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
                // The axios interceptor will handle the redirect
            } else {
                setError("Không thể tải kết quả kiểm tra");
            }
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (correctAnswers, totalQuestions) => {
        const percentage = (correctAnswers / totalQuestions) * 100;
        if (percentage >= 80) return "#22c55e";
        if (percentage >= 60) return "#f59e0b";
        return "#ef4444";
    };

    const getScoreStatus = (correctAnswers, totalQuestions) => {
        const percentage = (correctAnswers / totalQuestions) * 100;
        if (percentage >= 80) return "Xuất sắc";
        if (percentage >= 60) return "Khá";
        if (percentage >= 40) return "Trung bình";
        return "Cần cải thiện";
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Calculate statistics
    const totalTests = testResults.length;
    const averageScore =
        totalTests > 0
            ? testResults.reduce(
                (sum, result) =>
                    sum + (result.correctAnswers / result.totalQuestions) * 100,
                0
            ) / totalTests
            : 0;
    const passedTests = testResults.filter(
        (result) => (result.correctAnswers / result.totalQuestions) * 100 >= 60
    ).length;

    // Pagination
    const pageCount = Math.ceil(testResults.length / resultsPerPage) || 1;
    const paginatedResults = testResults.slice(
        (page - 1) * resultsPerPage,
        page * resultsPerPage
    );

    const handlePageChange = (event, value) => {
        setPage(value);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <Container
                    sx={{
                        mt: 6,
                        mb: 6,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        minHeight: "50vh",
                    }}
                >
                    <CircularProgress />
                </Container>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />

            {/* Hero Section */}
            <Box
                sx={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    py: 6,
                    mb: 4,
                }}
            >
                <Container>
                    <Typography
                        variant="h3"
                        fontWeight="bold"
                        color="white"
                        textAlign="center"
                    >
                        Kết quả kiểm tra
                    </Typography>
                    <Typography
                        variant="h6"
                        color="white"
                        textAlign="center"
                        sx={{ mt: 1, opacity: 0.9 }}
                    >
                        Theo dõi tiến độ học tập của bạn
                    </Typography>
                </Container>
            </Box>

            <Container sx={{ mb: 6 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* Statistics Cards */}
                {totalTests > 0 && (
                    <Grid container spacing={3} mb={4}>
                        <Grid item xs={12} md={4}>
                            <Paper
                                sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                    color: "white",
                                    boxShadow: "0 4px 20px rgba(102, 126, 234, 0.3)",
                                }}
                            >
                                <Box display="flex" alignItems="center" gap={2}>
                                    <QuizIcon sx={{ fontSize: 40 }} />
                                    <Box>
                                        <Typography variant="h4" fontWeight="bold">
                                            {totalTests}
                                        </Typography>
                                        <Typography variant="body2">Tổng số bài kiểm tra</Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Paper
                                sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                                    color: "white",
                                    boxShadow: "0 4px 20px rgba(34, 197, 94, 0.3)",
                                }}
                            >
                                <Box display="flex" alignItems="center" gap={2}>
                                    <CheckCircle sx={{ fontSize: 40 }} />
                                    <Box>
                                        <Typography variant="h4" fontWeight="bold">
                                            {passedTests}
                                        </Typography>
                                        <Typography variant="body2">Bài đạt yêu cầu</Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Paper
                                sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                                    color: "white",
                                    boxShadow: "0 4px 20px rgba(245, 158, 11, 0.3)",
                                }}
                            >
                                <Box display="flex" alignItems="center" gap={2}>
                                    <TrendingUp sx={{ fontSize: 40 }} />
                                    <Box>
                                        <Typography variant="h4" fontWeight="bold">
                                            {averageScore.toFixed(1)}%
                                        </Typography>
                                        <Typography variant="body2">Điểm trung bình</Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                )}

                {/* Test Results Grid */}
                {paginatedResults.length > 0 ? (
                    <>
                        <Grid container spacing={3}>
                            {paginatedResults.map((result) => {
                                const percentage =
                                    (result.correctAnswers / result.totalQuestions) * 100;
                                const scoreColor = getScoreColor(
                                    result.correctAnswers,
                                    result.totalQuestions
                                );
                                const status = getScoreStatus(
                                    result.correctAnswers,
                                    result.totalQuestions
                                );

                                return (
                                    <Grid item xs={12} md={6} key={result.resultId}>
                                        <Card
                                            sx={{
                                                borderRadius: 3,
                                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                                transition: "all 0.3s ease",
                                                cursor: "pointer",
                                                "&:hover": {
                                                    transform: "translateY(-4px)",
                                                    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                                                },
                                            }}
                                            onClick={() => navigate(`/test/${result.testId}`)}
                                        >
                                            <CardContent sx={{ p: 3 }}>
                                                {/* Test Info */}
                                                <Box display="flex" gap={2} mb={2}>
                                                    {result.testThumbnail && (
                                                        <Box
                                                            component="img"
                                                            src={result.testThumbnail}
                                                            alt={result.testTitle}
                                                            sx={{
                                                                width: 80,
                                                                height: 80,
                                                                borderRadius: 2,
                                                                objectFit: "cover",
                                                            }}
                                                        />
                                                    )}
                                                    <Box flex={1}>
                                                        <Typography
                                                            variant="h6"
                                                            fontWeight="bold"
                                                            sx={{
                                                                mb: 0.5,
                                                                overflow: "hidden",
                                                                textOverflow: "ellipsis",
                                                                display: "-webkit-box",
                                                                WebkitLineClamp: 2,
                                                                WebkitBoxOrient: "vertical",
                                                            }}
                                                        >
                                                            {result.testTitle}
                                                        </Typography>
                                                        {result.levelDetected && (
                                                            <Chip
                                                                label={`Trình độ: ${result.levelDetected}`}
                                                                size="small"
                                                                sx={{
                                                                    backgroundColor: "#667eea",
                                                                    color: "white",
                                                                    fontWeight: "bold",
                                                                    mb: 0.5,
                                                                }}
                                                            />
                                                        )}
                                                        <Chip
                                                            label={status}
                                                            size="small"
                                                            sx={{
                                                                backgroundColor: scoreColor,
                                                                color: "white",
                                                                fontWeight: "bold",
                                                                ml: result.levelDetected ? 1 : 0,
                                                            }}
                                                        />
                                                    </Box>
                                                </Box>

                                                {/* Score Display */}
                                                <Box
                                                    sx={{
                                                        p: 2,
                                                        borderRadius: 2,
                                                        backgroundColor: "#f8fafc",
                                                        mb: 2,
                                                    }}
                                                >
                                                    <Grid container spacing={2} mb={1}>
                                                        <Grid item xs={4}>
                                                            <Box textAlign="center">
                                                                <Typography
                                                                    variant="h6"
                                                                    fontWeight="bold"
                                                                    sx={{ color: "#22c55e" }}
                                                                >
                                                                    {result.correctAnswers}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Đúng
                                                                </Typography>
                                                            </Box>
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <Box textAlign="center">
                                                                <Typography
                                                                    variant="h6"
                                                                    fontWeight="bold"
                                                                    sx={{ color: "#ef4444" }}
                                                                >
                                                                    {result.incorrectAnswers}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Sai
                                                                </Typography>
                                                            </Box>
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <Box textAlign="center">
                                                                <Typography
                                                                    variant="h6"
                                                                    fontWeight="bold"
                                                                    sx={{ color: "#94a3b8" }}
                                                                >
                                                                    {result.skippedAnswers}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Bỏ qua
                                                                </Typography>
                                                            </Box>
                                                        </Grid>
                                                    </Grid>

                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={percentage}
                                                        sx={{
                                                            height: 8,
                                                            borderRadius: 5,
                                                            backgroundColor: "#e2e8f0",
                                                            "& .MuiLinearProgress-bar": {
                                                                backgroundColor: scoreColor,
                                                            },
                                                        }}
                                                    />
                                                    <Box
                                                        display="flex"
                                                        justifyContent="space-between"
                                                        alignItems="center"
                                                        mt={1}
                                                    >
                                                        <Typography variant="caption" color="text.secondary">
                                                            {percentage.toFixed(1)}% chính xác
                                                        </Typography>
                                                        <Typography
                                                            variant="body2"
                                                            fontWeight="bold"
                                                            sx={{ color: scoreColor }}
                                                        >
                                                            {result.overallScore.toFixed(1)} điểm
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                {/* Date and Time */}
                                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <CalendarToday
                                                            sx={{ fontSize: 16, color: "text.secondary" }}
                                                        />
                                                        <Typography variant="caption" color="text.secondary">
                                                            {formatDate(result.createdAt)}
                                                        </Typography>
                                                    </Box>
                                                    {result.timeSpent && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            Thời gian: {Math.floor(result.timeSpent / 60)} phút
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                );
                            })}
                        </Grid>

                        {/* Pagination */}
                        <Stack alignItems="center" mt={4}>
                            <Pagination
                                count={pageCount}
                                page={page}
                                onChange={handlePageChange}
                                color="primary"
                                size="large"
                            />
                        </Stack>
                    </>
                ) : (
                    <Paper
                        sx={{
                            p: 6,
                            borderRadius: 3,
                            textAlign: "center",
                            backgroundColor: "#f8fafc",
                        }}
                    >
                        <QuizIcon sx={{ fontSize: 80, color: "#cbd5e1", mb: 2 }} />
                        <Typography variant="h5" fontWeight="bold" color="text.secondary">
                            Chưa có kết quả kiểm tra
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                            Bắt đầu làm bài kiểm tra đầu vào để xem kết quả tại đây
                        </Typography>
                    </Paper>
                )}
            </Container>

            <Footer />
        </>
    );
}
