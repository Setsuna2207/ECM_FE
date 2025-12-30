import {
    Card,
    CardContent,
    Typography,
    Box,
    Grid,
    Chip,
    LinearProgress,
} from "@mui/material";
import { CalendarToday } from "@mui/icons-material";

export default function TestResultCard({ result }) {

    const getScoreColor = (correctAnswers, totalQuestions) => {
        const percentage = (correctAnswers / totalQuestions) * 100;
        if (percentage >= 80) return "#22c55e";
        if (percentage >= 60) return "#f59e0b";
        return "#ef4444";
    };

    const getScoreStatus = (correctAnswers, totalQuestions) => {
        const percentage = (correctAnswers / totalQuestions) * 100;
        if (percentage >= 80) return "Xuất sắc";
        if (percentage >= 60) return "Tốt";
        if (percentage >= 40) return "Trung bình";
        if (percentage >= 20) return "Yếu";
        return "Kém";
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

    const percentage = (result.correctAnswers / result.totalQuestions) * 100;
    const scoreColor = getScoreColor(result.correctAnswers, result.totalQuestions);
    const status = getScoreStatus(result.correctAnswers, result.totalQuestions);

    return (
        <Card
            sx={{
                borderRadius: 3,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                transition: "all 0.3s ease",
                "&:hover": {
                    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                },
            }}
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
                    {/* Total Questions Header */}
                    <Box display="flex" justifyContent="center" mb={2}>
                        <Typography variant="body2" color="text.secondary" fontWeight="medium">
                            Tổng số câu hỏi: <strong>{result.totalQuestions}</strong>
                        </Typography>
                    </Box>

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
    );
}
