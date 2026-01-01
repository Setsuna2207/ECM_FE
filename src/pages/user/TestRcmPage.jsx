import { useEffect, useState } from "react";
import { recommendTest } from "../../services/aiService";
import { useNavigate } from "react-router-dom";
import {
    Container,
    Paper,
    Typography,
    Button,
    Box,
    CircularProgress,
    Alert,
    Chip,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import QuizIcon from "@mui/icons-material/Quiz";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const TestRcmPage = () => {
    const [loading, setLoading] = useState(true);
    const [suggestion, setSuggestion] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSuggestion = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await recommendTest();
                setSuggestion(res.data);
            } catch (err) {
                console.error("Error fetching test recommendation:", err);
                setError(
                    err.response?.data?.message ||
                    "Không thể tải gợi ý bài test. Vui lòng thử lại sau."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchSuggestion();
    }, []);

    return (
        <>
            <Navbar />
            <Container sx={{ mt: 6, mb: 6, minHeight: "60vh" }}>
                <Paper
                    sx={{
                        p: 4,
                        borderRadius: 4,
                        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                        border: "1px solid rgba(255,255,255,0.8)",
                    }}
                >
                    {/* Header */}
                    <Box
                        display="flex"
                        alignItems="center"
                        gap={2}
                        mb={4}
                        sx={{
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            borderRadius: 3,
                            p: 3,
                            color: "white",
                        }}
                    >
                        <AutoAwesomeIcon
                            sx={{
                                fontSize: 40,
                                animation: "pulse 2s infinite",
                                "@keyframes pulse": {
                                    "0%, 100%": { opacity: 1, transform: "scale(1)" },
                                    "50%": { opacity: 0.7, transform: "scale(1.1)" },
                                },
                            }}
                        />
                        <Box flex={1}>
                            <Typography variant="h4" fontWeight="bold">
                                Gợi ý bài test từ AI
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                                Dựa trên mục tiêu học tập của bạn
                            </Typography>
                        </Box>
                        <Chip
                            icon={<AutoAwesomeIcon sx={{ color: "white !important" }} />}
                            label="AI Powered"
                            sx={{
                                backgroundColor: "rgba(255,255,255,0.25)",
                                color: "white",
                                fontWeight: "bold",
                                backdropFilter: "blur(10px)",
                                border: "1px solid rgba(255,255,255,0.3)",
                            }}
                        />
                    </Box>

                    {/* Loading State */}
                    {loading && (
                        <Box
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                            justifyContent="center"
                            py={8}
                        >
                            <CircularProgress size={60} sx={{ mb: 3 }} />
                            <Typography variant="h6" color="text.secondary">
                                Đang phân tích mục tiêu học tập của bạn...
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                AI đang tìm bài test phù hợp nhất
                            </Typography>
                        </Box>
                    )}

                    {/* Error State */}
                    {!loading && error && (
                        <Box py={4}>
                            <Alert severity="error" sx={{ mb: 3 }}>
                                {error}
                            </Alert>
                            <Box display="flex" gap={2} justifyContent="center">
                                <Button
                                    variant="contained"
                                    onClick={() => window.location.reload()}
                                    sx={{
                                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                        textTransform: "none",
                                        fontWeight: "bold",
                                    }}
                                >
                                    Thử lại
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate("/profile")}
                                    sx={{ textTransform: "none" }}
                                >
                                    Cập nhật mục tiêu
                                </Button>
                            </Box>
                        </Box>
                    )}

                    {/* No Suggestion State */}
                    {!loading && !error && !suggestion && (
                        <Box py={4} textAlign="center">
                            <Alert severity="info" sx={{ mb: 3 }}>
                                Bạn cần thiết lập mục tiêu học tập trước khi nhận gợi ý bài test từ AI.
                            </Alert>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                                Hãy vào trang cá nhân để thiết lập mục tiêu học tập của bạn<br />
                                (ví dụ: "IELTS READING 5.5", "TOEIC LISTENING 600", v.v.)
                            </Typography>
                            <Box display="flex" gap={2} justifyContent="center">
                                <Button
                                    variant="contained"
                                    onClick={() => navigate("/profile")}
                                    sx={{
                                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                        textTransform: "none",
                                        fontWeight: "bold",
                                    }}
                                >
                                    Thiết lập mục tiêu
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate("/tests")}
                                    sx={{ textTransform: "none" }}
                                >
                                    Xem tất cả bài test
                                </Button>
                            </Box>
                        </Box>
                    )}

                    {/* Success State - Show Recommendation */}
                    {!loading && !error && suggestion && (
                        <Box>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 4,
                                    background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                                    border: "2px solid #bae6fd",
                                    borderRadius: 3,
                                    mb: 3,
                                }}
                            >
                                <Box display="flex" alignItems="start" gap={2} mb={2}>
                                    <QuizIcon sx={{ fontSize: 32, color: "#0284c7" }} />
                                    <Box flex={1}>
                                        <Typography variant="h5" fontWeight="bold" color="#0c4a6e" mb={1}>
                                            {suggestion.testTitle || suggestion.TestTitle || "Bài test được đề xuất"}
                                        </Typography>
                                        <Typography variant="body1" color="#0369a1" sx={{ lineHeight: 1.8 }}>
                                            {suggestion.reason || suggestion.Reason || "Bài test này phù hợp với mục tiêu học tập của bạn"}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Paper>

                            <Box display="flex" gap={2} justifyContent="center">
                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={<QuizIcon />}
                                    onClick={() => navigate(`/test/${suggestion.testId || suggestion.TestId || suggestion.testID || suggestion.TestID}`)}
                                    sx={{
                                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                        textTransform: "none",
                                        fontWeight: "bold",
                                        px: 4,
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
                                    Làm bài test này
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    onClick={() => navigate("/tests")}
                                    sx={{
                                        textTransform: "none",
                                        fontWeight: "bold",
                                        px: 4,
                                        py: 1.5,
                                        borderRadius: 2.5,
                                    }}
                                >
                                    Xem tất cả bài test
                                </Button>
                            </Box>
                        </Box>
                    )}
                </Paper>
            </Container>
            <Footer />
        </>
    );
};

export default TestRcmPage;
