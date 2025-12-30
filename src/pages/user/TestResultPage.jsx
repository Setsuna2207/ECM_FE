import { useState, useEffect } from "react";
import {
    Container,
    Typography,
    Box,
    Paper,
    Grid,
    CircularProgress,
    Alert,
    Stack,
    Pagination,
} from "@mui/material";
import {
    CheckCircle,
    Quiz as QuizIcon,
    TrendingUp,
} from "@mui/icons-material";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import TestResultCard from "../../components/TestResultCard";
import { GetTestResultsByUserId } from "../../services/testResultService";
import { GetPlacementTestById } from "../../services/placementTestService";

export default function TestResultPage() {
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
                window.location.href = "/login";
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
                            testTitle: result.TestTitle || result.testTitle, // Get title from result
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
                            totalQuestions: (result.CorrectAnswers || result.correctAnswers || 0) +
                                (result.IncorrectAnswers || result.incorrectAnswers || 0) +
                                (result.SkippedAnswers || result.skippedAnswers || 0),
                        };

                        // If we don't have a title, try to fetch test details
                        if (!normalizedResult.testTitle) {
                            try {
                                const testResponse = await GetPlacementTestById(normalizedResult.testId);
                                const test = testResponse.data;

                                console.log("Test details for testId", normalizedResult.testId, ":", test);
                                console.log("Test keys:", test ? Object.keys(test) : "null");

                                normalizedResult.testTitle = test?.title || test?.Title || test?.name || test?.Name || `Bài kiểm tra #${normalizedResult.testId}`;
                                normalizedResult.testDescription = test?.description || test?.Description || "";
                                normalizedResult.testThumbnail = test?.thumbnailUrl || test?.ThumbnailUrl || "";
                            } catch (err) {
                                console.error("Error fetching test details:", err);
                                normalizedResult.testTitle = `Bài kiểm tra #${normalizedResult.testId}`;
                            }
                        }

                        return normalizedResult;
                    } catch (err) {
                        console.error("Error processing result:", result, err);
                        const testId = result.TestID || result.testId;
                        const total = (result.CorrectAnswers || 0) + (result.IncorrectAnswers || 0) + (result.SkippedAnswers || 0);
                        return {
                            resultId: result.ResultID || result.resultId,
                            testId: testId,
                            testTitle: result.TestTitle || result.testTitle || `Bài kiểm tra #${testId}`,
                            correctAnswers: result.CorrectAnswers || result.correctAnswers,
                            incorrectAnswers: result.IncorrectAnswers || result.incorrectAnswers,
                            skippedAnswers: result.SkippedAnswers || result.skippedAnswers,
                            overallScore: result.OverallScore || result.overallScore,
                            levelDetected: result.LevelDetected || result.levelDetected,
                            timeSpent: result.TimeSpent || result.timeSpent,
                            createdAt: result.CreatedAt || result.createdAt,
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

    const handlePageChange = (_event, value) => {
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
                    >
                        Kết quả kiểm tra
                    </Typography>
                    <Typography
                        variant="h6"
                        color="white"
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
                    </Grid>
                )}

                {/* Test Results Grid */}
                {paginatedResults.length > 0 ? (
                    <>
                        <Grid container spacing={3}>
                            {paginatedResults.map((result) => (
                                <Grid item xs={12} md={6} key={result.resultId}>
                                    <TestResultCard result={result} />
                                </Grid>
                            ))}
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
