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
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import { useNavigate } from "react-router-dom";

export default function MiniCourseCard({ course }) {
  const navigate = useNavigate();

  // Extract data with fallbacks for both PascalCase and camelCase
  const lessonCount = course.totalLessons || course.TotalLessons || 0;

  // Construct full thumbnail URL if it's a relative path
  const getThumbnailUrl = (thumbnail) => {
    if (!thumbnail) return "";
    if (thumbnail.startsWith('http')) return thumbnail;

    const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'https://localhost:7264';
    return `${baseUrl}${thumbnail.startsWith('/') ? '' : '/'}${thumbnail}`;
  };

  const thumbnailUrl = getThumbnailUrl(course.thumbnailUrl || course.ThumbnailUrl || course.thumbnail);

  // Get categories - handle both string array and object array formats
  const categories = course.categories || [];

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
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
        },
      }}
    >
      {/* Image with overlay */}
      <Box sx={{ position: "relative", overflow: "hidden" }}>
        <CardMedia
          component="img"
          height="175"
          image={thumbnailUrl}
          alt={course.title}
          onError={(e) => {
            console.error("MiniCourseCard image failed to load:", thumbnailUrl);
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
            mb: 1,
          }}
        >
          {course.title}
        </Typography>

        {/* Action button */}
        <Button
          variant="contained"
          fullWidth
          size="large"
          startIcon={<PlayCircleOutlineIcon />}
          onClick={() => navigate(`/course/${course.courseId}`)}
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