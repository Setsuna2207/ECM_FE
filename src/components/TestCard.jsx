// src/components/TestCard.jsx
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SchoolIcon from "@mui/icons-material/School";
import QuizIcon from "@mui/icons-material/Quiz";
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
        width: 350, // Fixed width
        height: 350, // Fixed height (square)
        borderRadius: 3,
        boxShadow: 3,
        display: "flex",
        flexDirection: "column",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 6,
        },
      }}
    >
      {/* Header / Icon */}
      <Box
        sx={{
          flex: "0 0 35%", // 35% height for header
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <QuizIcon sx={{ fontSize: 60, color: "white", opacity: 0.9 }} />
        {test.level && (
          <Chip
            label={test.level}
            size="small"
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              backgroundColor: "rgba(255,255,255,0.9)",
              fontWeight: 600,
            }}
          />
        )}
      </Box>

      <CardContent
        sx={{
          flex: "1 0 65%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          overflow: "hidden",
          padding: 2,
        }}
      >
        {/* Title */}
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {test.title}
        </Typography>

        {/* Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {test.description}
        </Typography>

        {/* Info row */}
        <Box display="flex" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={0.5}>
            <AccessTimeIcon sx={{ fontSize: 18, color: "text.secondary" }} />
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {test.duration} phút
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={0.5}>
            <SchoolIcon sx={{ fontSize: 18, color: "text.secondary" }} />
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {test.totalQuestions} câu
            </Typography>
          </Box>
        </Box>

        {/* Start Test Button */}
        <Button
          variant="contained"
          fullWidth
          sx={{
            mt: 1,
            backgroundColor: "#4038d2ff",
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,
            "&:hover": { backgroundColor: "#73169aff" },
          }}
          onClick={handleStartTest}
        >
          Bắt đầu làm bài
        </Button>
      </CardContent>
    </Card>
  );
}
