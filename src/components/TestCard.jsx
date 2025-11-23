// src/components/TestCard.jsx
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import QuizIcon from "@mui/icons-material/Quiz";
import SchoolIcon from "@mui/icons-material/School";
import { useNavigate } from "react-router-dom";

export default function TestCard({ test }) {
  const navigate = useNavigate();

  const handleStartTest = () => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user) {
      alert("Bạn cần đăng nhập để làm bài test.");
      return;
    }
    navigate(`/test/${test.testId}`);
  };

  return (
    <Card
      sx={{
        width: 550,
        borderRadius: 3,
        boxShadow: 3,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 6,
        },
      }}
    >
      {/* Card Image/Header */}
      <Box
        sx={{
          height: 180,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <QuizIcon sx={{ fontSize: 80, color: "white", opacity: 0.9 }} />
        {test.level && (
          <Chip
            label={test.level}
            size="small"
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              fontWeight: 600,
            }}
          />
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1 }}>
        {/* Title */}
        <Typography variant="h6" fontWeight="bold">
          {test.title}
        </Typography>

        {/* Description - 1 line truncated */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "normal",
            mb: 1,
          }}
        >
          {test.description}
        </Typography>

        {/* Info Row: Duration + Questions */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          gap={1}
          mt={1.5}
        >
          {/* Duration */}
          <Box display="flex" alignItems="center" gap={0.5}>
            <AccessTimeIcon sx={{ fontSize: 18, color: "text.secondary" }} />
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {test.duration} phút
            </Typography>
          </Box>

          {/* Total Questions */}
          <Box display="flex" alignItems="center" gap={0.5}>
            <SchoolIcon sx={{ fontSize: 18, color: "text.secondary" }} />
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {test.totalQuestions} câu hỏi
            </Typography>
          </Box>
        </Box>

        {/* Start Test Button */}
        <Button
          variant="contained"
          fullWidth
          sx={{
            mt: 2,
            backgroundColor: "#4038d2ff",
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,
            "&:hover": {
              backgroundColor: "#73169aff",
            },
          }}
          onClick={handleStartTest}
        >
          Bắt đầu làm bài
        </Button>
      </CardContent>
    </Card>
  );
}