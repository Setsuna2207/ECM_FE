import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  Card,
  CardContent,
  CircularProgress,
  Paper,
  TextField,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { mockTests } from "../data/mockTest";
import { getTestById } from "../data/test/testRegistry";

export default function TestDetailPage() {
  const { testId } = useParams();
  const [test, setTest] = useState(null);
  const [allQuestions, setAllQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openResultDialog, setOpenResultDialog] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const navigate = useNavigate();
  
  const questionRefs = useRef({});

  useEffect(() => {
    // Find test from mockTests
    const selectedTest = mockTests.find(t => t.testId === testId);
    
    if (!selectedTest) {
      setLoading(false);
      return;
    }

    // Get test data from registry
    const testData = getTestById(testId);
    
    if (testData) {
      setTest(testData);
      
      // Flatten all questions from all sections
      const questions = [];
      testData.sections.forEach(section => {
        section.questions.forEach(q => {
          questions.push({
            ...q,
            sectionTitle: section.title,
            sectionId: section.sectionId
          });
        });
      });
      setAllQuestions(questions);
      setTimeRemaining(testData.duration * 60); // Convert to seconds
    }
    
    setLoading(false);
  }, [testId]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0 || score !== null) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, score]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const scrollToQuestion = (questionId) => {
    questionRefs.current[questionId]?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center' 
    });
  };

  const handleSubmit = () => {
    if (window.confirm("Bạn có chắc muốn nộp bài?")) {
      let totalScore = 0;
      let maxScore = 0;

      allQuestions.forEach(q => {
        maxScore += q.points || 2;
        
        if (q.type === "multiple-choice") {
          if (answers[q.questionId] === q.correctAnswer) {
            totalScore += q.points || 2;
          }
        } else if (q.type === "essay" || q.type === "short-response") {
          // For essay questions, assign partial credit if answered
          if (answers[q.questionId] && answers[q.questionId].trim().length > 0) {
            totalScore += (q.points || 5) * 0.7; // 70% credit for completion
          }
        }
      });

      const percentage = Math.round((totalScore / maxScore) * 100);
      setScore({ total: totalScore, max: maxScore, percentage });
      setOpenResultDialog(true);
      
      // Save result to localStorage
      const testResults = JSON.parse(localStorage.getItem("testResults")) || [];
      testResults.push({
        testId: test.testId,
        title: test.title,
        score: totalScore,
        maxScore: maxScore,
        percentage: percentage,
        date: new Date().toISOString(),
      });
      localStorage.setItem("testResults", JSON.stringify(testResults));
      
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getAnswerStatus = (questionId) => {
    return answers[questionId] !== undefined ? "answered" : "unanswered";
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!test) {
    return (
      <>
        <Navbar />
        <Box textAlign="center" mt={10}>
          <Typography variant="h5">Không tìm thấy bài test!</Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 2 }} 
            onClick={() => navigate("/tests")}
          >
            Quay lại danh sách test
          </Button>
        </Box>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      
      <Box sx={{ display: "flex", gap: 3, maxWidth: 1400, mx: "auto", mt: 4, mb: 8, px: 3 }}>
        {/* LEFT SIDE - Questions */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {test.title}
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            {test.description}
          </Typography>

          {/* Questions by Section */}
          {test.sections.map(section => (
            <Box key={section.sectionId} mb={4}>
              <Paper sx={{ p: 2, mb: 2, backgroundColor: "#f5f5f5" }}>
                <Typography variant="h5" fontWeight="600">
                  {section.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {section.description}
                </Typography>
                {section.mediaUrl && (
                  <Box mt={2}>
                    <audio controls style={{ width: "100%", maxWidth: 500 }}>
                      <source src={section.mediaUrl} type="audio/mpeg" />
                    </audio>
                  </Box>
                )}
              </Paper>

              {section.questions.map((q) => (
                <Card
                  key={q.questionId}
                  ref={el => questionRefs.current[q.questionId] = el}
                  sx={{
                    mb: 3,
                    p: 2,
                    borderRadius: 2,
                    border: score !== null 
                      ? (q.type === "multiple-choice" && answers[q.questionId] === q.correctAnswer)
                        ? "2px solid #4caf50"
                        : "2px solid #ddd"
                      : "1px solid #ddd",
                  }}
                >
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                      <Typography variant="subtitle1" fontWeight="600">
                        Câu {q.questionId}: {q.question}
                      </Typography>
                      <Chip 
                        label={`${q.points} điểm`} 
                        size="small" 
                        color="primary"
                        variant="outlined"
                      />
                    </Box>

                    {q.passage && (
                      <Paper sx={{ p: 2, mb: 2, backgroundColor: "#f9f9f9" }}>
                        <Typography variant="body2">{q.passage}</Typography>
                      </Paper>
                    )}

                    {q.audioTimestamp && (
                      <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                        🎧 Nghe đoạn: {q.audioTimestamp}
                      </Typography>
                    )}

                    {/* Multiple Choice */}
                    {q.type === "multiple-choice" && (
                      <RadioGroup
                        value={answers[q.questionId] ?? ""}
                        onChange={(e) => handleAnswer(q.questionId, parseInt(e.target.value))}
                      >
                        {q.options.map((opt, i) => (
                          <FormControlLabel
                            key={i}
                            value={i}
                            control={<Radio />}
                            label={opt}
                            disabled={score !== null}
                          />
                        ))}
                      </RadioGroup>
                    )}

                    {/* Essay / Short Response */}
                    {(q.type === "essay" || q.type === "short-response") && (
                      <TextField
                        fullWidth
                        multiline
                        rows={q.type === "essay" ? 6 : 3}
                        placeholder={`Viết câu trả lời (${q.minWords}-${q.maxWords} từ)...`}
                        value={answers[q.questionId] || ""}
                        onChange={(e) => handleAnswer(q.questionId, e.target.value)}
                        disabled={score !== null}
                        sx={{ mt: 1 }}
                      />
                    )}

                    {/* Sentence Completion */}
                    {q.type === "sentence-completion" && (
                      <TextField
                        fullWidth
                        placeholder="Điền câu trả lời..."
                        value={answers[q.questionId] || ""}
                        onChange={(e) => handleAnswer(q.questionId, e.target.value)}
                        disabled={score !== null}
                        sx={{ mt: 1 }}
                      />
                    )}

                    {/* Error Correction */}
                    {q.type === "error-correction" && (
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        placeholder="Viết câu đã sửa lỗi..."
                        value={answers[q.questionId] || ""}
                        onChange={(e) => handleAnswer(q.questionId, e.target.value)}
                        disabled={score !== null}
                        sx={{ mt: 1 }}
                      />
                    )}

                    {score !== null && q.type === "multiple-choice" && (
                      <Typography
                        variant="body2"
                        sx={{ mt: 1, color: answers[q.questionId] === q.correctAnswer ? "green" : "error.main" }}
                      >
                        {answers[q.questionId] === q.correctAnswer
                          ? "✅ Đúng"
                          : `❌ Sai (Đáp án đúng: ${q.options[q.correctAnswer]})`}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          ))}
        </Box>

        {/* RIGHT SIDE - Sticky Navigation Panel */}
        <Box sx={{ width: 320, flexShrink: 0 }}>
          <Paper
            elevation={3}
            sx={{
              position: "sticky",
              top: 80,
              p: 2,
              borderRadius: 2,
              maxHeight: "calc(100vh - 100px)",
              overflow: "auto",
            }}
          >
            {/* Timer */}
            {score === null && (
              <Box sx={{ mb: 2, p: 2, backgroundColor: "#f5f5f5", borderRadius: 2, textAlign: "center" }}>
                <Typography variant="h6" fontWeight="600">
                  ⏱️ Thời gian còn lại
                </Typography>
                <Typography 
                  variant="h4" 
                  color={timeRemaining < 300 ? "error" : "primary"} 
                  fontWeight="bold"
                >
                  {formatTime(timeRemaining)}
                </Typography>
              </Box>
            )}

            {/* Audio Player (if available) */}
            {test.sections.some(s => s.mediaUrl) && score === null && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" fontWeight="600" mb={1}>
                  🎧 Audio
                </Typography>
                <Paper sx={{ p: 1, backgroundColor: "#f9f9f9" }}>
                  <audio controls style={{ width: "100%" }}>
                    <source src={test.sections.find(s => s.mediaUrl)?.mediaUrl} type="audio/mpeg" />
                  </audio>
                </Paper>
              </Box>
            )}

            {/* Question Navigation */}
            <Typography variant="subtitle2" fontWeight="600" mb={1}>
              Danh sách câu hỏi
            </Typography>
            <Grid container spacing={1}>
              {allQuestions.map((q) => {
                const status = getAnswerStatus(q.questionId);
                return (
                  <Grid item xs={3} key={q.questionId}>
                    <Button
                      variant={status === "answered" ? "contained" : "outlined"}
                      color={status === "answered" ? "success" : "default"}
                      onClick={() => scrollToQuestion(q.questionId)}
                      sx={{
                        minWidth: 0,
                        width: "100%",
                        aspectRatio: "1",
                        fontWeight: 600,
                      }}
                    >
                      {q.questionId}
                    </Button>
                  </Grid>
                );
              })}
            </Grid>

            {/* Progress Summary */}
            <Box sx={{ mt: 2, p: 2, backgroundColor: "#f5f5f5", borderRadius: 2 }}>
              <Typography variant="body2" fontWeight="600">
                Tiến độ: {Object.keys(answers).length} / {allQuestions.length}
              </Typography>
            </Box>

            {/* Submit Button */}
            {score === null && (
              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                onClick={handleSubmit}
                sx={{ 
                  mt: 2, 
                  borderRadius: 2, 
                  py: 1.5,
                  backgroundColor: "#4038d2ff",
                  "&:hover": { backgroundColor: "#73169aff" }
                }}
              >
                Nộp bài
              </Button>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Result Dialog */}
      <Dialog open={openResultDialog} onClose={() => setOpenResultDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>🎉 Kết quả bài test</DialogTitle>
        <DialogContent>
          <Box textAlign="center" py={2}>
            <Typography variant="h3" fontWeight="bold" color="primary" mb={2}>
              {score?.percentage}%
            </Typography>
            <Typography variant="h6" mb={1}>
              Điểm: {score?.total?.toFixed(1)} / {score?.max}
            </Typography>
            
            {test.scoring?.levels.map(level => {
              if (score?.percentage >= level.min && score?.percentage <= level.max) {
                return (
                  <Box key={level.level} mt={3}>
                    <Chip 
                      label={level.level} 
                      color="primary" 
                      size="large"
                      sx={{ fontSize: 16, py: 2, px: 1 }}
                    />
                    <Typography variant="body1" mt={2} color="text.secondary">
                      💡 Khuyến nghị: {level.recommendation}
                    </Typography>
                  </Box>
                );
              }
              return null;
            })}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenResultDialog(false)}>Đóng</Button>
          <Button variant="contained" onClick={() => navigate("/courses")}>
            Xem khóa học
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </>
  );
}