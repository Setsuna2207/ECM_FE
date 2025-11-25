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
import { mockLessons } from "../data/mockLesson";
import { mockReviews } from "../data/mockReview";
import { useNavigate } from "react-router-dom";

export default function MiniCourseCard({ course }) {
  const navigate = useNavigate();

  // Calculate lesson count
  const lessonCount = mockLessons.filter(
    (lesson) => lesson.courseId === course.courseId
  ).length;

  // Get categories
  const levelCategory = course.categories?.find(
    (cat) => cat.description === "LEVEL"
  );
  const skillCategory = course.categories?.find(
    (cat) => cat.description === "SKILL"
  );

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
          image={course.thumbnail}
          alt={course.title}
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
              label={levelCategory.name}
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
              label={skillCategory.name}
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