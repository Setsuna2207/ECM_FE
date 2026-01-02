import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Button,
    Box,
    Chip,
    Paper,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useNavigate } from "react-router-dom";

export default function RcmCourseCard({ course }) {
    const navigate = useNavigate();

    // Extract data with fallbacks for both PascalCase and camelCase
    const lessonCount = course.totalLessons || course.TotalLessons || 0;
    const averageRating = course.rating || course.AverageRating || course.averageRating || 0;
    const reviewCount = course.totalReviews || course.TotalReviews || course.totalReviews || 0;

    // Construct full thumbnail URL if it's a relative path
    const getThumbnailUrl = (thumbnail) => {
        if (!thumbnail) return "";
        if (thumbnail.startsWith('http')) return thumbnail;

        const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'https://localhost:7264';
        return `${baseUrl}${thumbnail.startsWith('/') ? '' : '/'}${thumbnail}`;
    };

    const thumbnailUrl = getThumbnailUrl(course.thumbnailUrl || course.ThumbnailUrl || course.thumbnail);

    // Render stars
    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(
                    <StarIcon key={i} sx={{ color: "#FFD700", fontSize: 18 }} />
                );
            } else if (i === fullStars && hasHalfStar) {
                stars.push(
                    <StarIcon key={i} sx={{ color: "#FFD700", fontSize: 18, opacity: 0.5 }} />
                );
            } else {
                stars.push(
                    <StarIcon key={i} sx={{ color: "#E0E0E0", fontSize: 18 }} />
                );
            }
        }
        return stars;
    };

    // Get categories - handle both string array and object array formats
    const categories = course.categories || [];

    // For string array format from backend
    const levelCategory = categories.find(cat => {
        const catName = typeof cat === 'string' ? cat : cat.name || '';
        return catName.toUpperCase().includes('TOEIC') ||
            catName.toUpperCase().includes('IELTS') ||
            catName.toUpperCase().includes('TOEFL') ||
            catName.toUpperCase().includes('GENERAL');
    });

    const skillCategory = categories.find(cat => {
        const catName = typeof cat === 'string' ? cat : cat.name || '';
        return catName.toUpperCase().includes('LISTENING') ||
            catName.toUpperCase().includes('SPEAKING') ||
            catName.toUpperCase().includes('READING') ||
            catName.toUpperCase().includes('WRITING') ||
            catName.toUpperCase().includes('GRAMMAR') ||
            catName.toUpperCase().includes('VOCABULARY');
    });

    // Format category for display
    const formatCategory = (cat) => {
        if (!cat) return null;
        return typeof cat === 'string' ? cat : cat.name || '';
    };

    return (
        <Card
            sx={{
                width: 350,
                borderRadius: 3,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                transition: "all 0.3s ease",
                position: "relative",
                overflow: "hidden",
                border: "2px solid #bae6fd",
                "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 12px 24px rgba(102, 126, 234, 0.2)",
                    borderColor: "#0ea5e9",
                },
            }}
        >
            {/* Image with overlay */}
            <Box sx={{ position: "relative", overflow: "hidden" }}>
                <CardMedia
                    component="img"
                    height="200"
                    image={thumbnailUrl}
                    alt={course.title}
                    onError={(e) => {
                        console.error("RcmCourseCard image failed to load:", thumbnailUrl);
                        e.target.style.display = 'none';
                    }}
                    sx={{
                        transition: "transform 0.3s ease",
                        "&:hover": {
                            transform: "scale(1.05)",
                        },
                    }}
                />

                {/* Gradient overlay */}
                <Box
                    sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.3) 100%)",
                    }}
                />

                {/* AI Recommended Badge */}
                <Chip
                    icon={<AutoAwesomeIcon sx={{ color: "white !important", fontSize: 16 }} />}
                    label="AI Đề xuất"
                    size="small"
                    sx={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        backgroundColor: "rgba(102, 126, 234, 0.95)",
                        color: "white",
                        fontWeight: 700,
                        fontSize: 12,
                        backdropFilter: "blur(8px)",
                        boxShadow: "0 2px 8px rgba(102, 126, 234, 0.4)",
                    }}
                />

                {/* Category badges on image */}
                <Box
                    sx={{
                        position: "absolute",
                        top: 12,
                        left: 12,
                        display: "flex",
                        gap: 1,
                        flexWrap: "wrap",
                    }}
                >
                    {levelCategory && (
                        <Chip
                            label={formatCategory(levelCategory)}
                            size="small"
                            sx={{
                                backgroundColor: "rgba(103, 58, 183, 0.9)",
                                color: "white",
                                fontWeight: 700,
                                fontSize: 12,
                                backdropFilter: "blur(8px)",
                            }}
                        />
                    )}
                    {skillCategory && (
                        <Chip
                            label={formatCategory(skillCategory)}
                            size="small"
                            sx={{
                                backgroundColor: "rgba(233, 30, 99, 0.9)",
                                color: "white",
                                fontWeight: 700,
                                fontSize: 12,
                                backdropFilter: "blur(8px)",
                            }}
                        />
                    )}
                </Box>

                {/* Lesson count badge */}
                <Paper
                    elevation={0}
                    sx={{
                        position: "absolute",
                        bottom: 12,
                        right: 12,
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        backdropFilter: "blur(8px)",
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 2,
                    }}
                >
                    <MenuBookIcon sx={{ fontSize: 18, color: "#4038d2ff" }} />
                    <Typography variant="body2" fontWeight={700} color="#4038d2ff">
                        {lessonCount} bài học
                    </Typography>
                </Paper>
            </Box>

            <CardContent sx={{ flexGrow: 1, p: 3 }}>
                {/* Title */}
                <Typography
                    variant="h6"
                    fontWeight="700"
                    sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        minHeight: 56,
                        lineHeight: 1.4,
                    }}
                >
                    {course.title}
                </Typography>

                {/* AI Reason - Integrated into card */}
                {course.aiReason && (
                    <Paper
                        elevation={0}
                        sx={{
                            mt: 1.5,
                            mb: 1.5,
                            p: 1.5,
                            background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                            border: "1px solid #bae6fd",
                            borderRadius: 2,
                        }}
                    >
                        <Box display="flex" alignItems="start" gap={1}>
                            <AutoAwesomeIcon
                                sx={{
                                    fontSize: 16,
                                    color: "#0284c7",
                                    mt: 0.2,
                                    flexShrink: 0,
                                }}
                            />
                            <Typography
                                variant="caption"
                                sx={{
                                    color: "#0c4a6e",
                                    lineHeight: 1.5,
                                    fontWeight: 500,
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                }}
                            >
                                {course.aiReason}
                            </Typography>
                        </Box>
                    </Paper>
                )}

                {/* Rating section */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        p: 1.5,
                        backgroundColor: "#f8f9fa",
                        borderRadius: 2,
                        mb: 1.5,
                    }}
                >
                    <Box display="flex" alignItems="center">
                        {renderStars(averageRating)}
                    </Box>
                    <Typography
                        variant="h6"
                        fontWeight="700"
                        color="text.primary"
                        sx={{ ml: 0.5 }}
                    >
                        {averageRating.toFixed(1)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        ({reviewCount} đánh giá)
                    </Typography>
                </Box>

                {/* Action button */}
                <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<PlayCircleOutlineIcon />}
                    onClick={() => {
                        const courseId = course.courseId || course.CourseID || course.courseID;
                        console.log("Navigating to course:", courseId);
                        navigate(`/course/${courseId}`);
                    }}
                    sx={{
                        borderRadius: 2,
                        py: 1.5,
                        fontWeight: 700,
                        fontSize: 16,
                        textTransform: "none",
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        boxShadow: "0 4px 12px rgba(103, 58, 183, 0.3)",
                        "&:hover": {
                            background: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                            boxShadow: "0 6px 16px rgba(103, 58, 183, 0.4)",
                            transform: "translateY(-2px)",
                        },
                        transition: "all 0.3s ease",
                    }}
                >
                    Xem chi tiết
                </Button>
            </CardContent>
        </Card>
    );
}
