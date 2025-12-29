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
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Alert,
} from "@mui/material";
import ArticleIcon from "@mui/icons-material/Article";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import { GetQuizById } from "../../services/quizService";
import { UpdateProgress } from "../../services/historyService";
import { CreateQuizResult, GetAllQuizResults } from "../../services/quizResultService";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function QuizPage() {
  const { courseId, lessonId, quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openResultDialog, setOpenResultDialog] = useState(false);
  const [previousResult, setPreviousResult] = useState(null);
  const [showRetakeDialog, setShowRetakeDialog] = useState(false);
  const [viewMode, setViewMode] = useState('new'); // 'new', 'review', 'retake'
  const navigate = useNavigate();

  const questionRefs = useRef({});

  useEffect(() => {
    fetchQuizData();
  }, [quizId]);

  const fetchQuizData = async () => {
    try {
      setLoading(true);
      setError(null);

      const quizRes = await GetQuizById(quizId);
      const quizData = quizRes.data;

      setQuiz(quizData);

      // Questions are now included in the quiz response
      const questionsData = quizData.Questions || quizData.questions;
      if (questionsData && questionsData.length > 0) {
        // Normalize property names to camelCase for consistency
        const normalizedQuestions = questionsData.map(q => ({
          questionId: q.QuestionId || q.questionId,
          question: q.Question || q.question,
          options: q.Options || q.options,
          correctAnswer: q.CorrectAnswer !== undefined ? q.CorrectAnswer : q.correctAnswer
        }));
        setQuestions(normalizedQuestions);
      } else {
        setError("Bài quiz này chưa có câu hỏi");
      }

      // Check if user has completed this quiz before
      try {
        const user = JSON.parse(localStorage.getItem("currentUser"));
        if (user) {
          // Check localStorage for completed quizzes
          const progressData = JSON.parse(localStorage.getItem("courseProgress")) || {};
          const cid = String(courseId);
          const lid = String(lessonId);

          const lessonProgress = progressData[cid]?.[lid];

          if (lessonProgress && lessonProgress.completed) {
            // User has completed this quiz before
            setPreviousResult({
              Score: lessonProgress.score || 0,
              TotalQuestions: lessonProgress.total || questions.length,
              UserAnswers: JSON.stringify(lessonProgress.answers || {}),
              SubmittedAt: lessonProgress.date || new Date().toISOString(),
            });
            setShowRetakeDialog(true);
          }
        }
      } catch (err) {
        console.error("Error checking previous results:", err);
        // Continue even if we can't check previous results
      }

    } catch (err) {
      console.error("Error fetching quiz:", err);
      setError("Không thể tải dữ liệu quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId, choice) => {
    setAnswers((prev) => ({ ...prev, [questionId]: choice }));
  };

  const handleViewPreviousResult = () => {
    setShowRetakeDialog(false);
    setViewMode('review');

    // Parse previous answers
    let previousAnswers = {};
    try {
      const answersStr = previousResult.UserAnswers || previousResult.userAnswers;
      if (typeof answersStr === 'string') {
        previousAnswers = JSON.parse(answersStr);
      } else {
        previousAnswers = answersStr || {};
      }
    } catch (e) {
      console.error("Error parsing previous answers:", e);
      previousAnswers = {};
    }

    setAnswers(previousAnswers);

    // Set previous score
    const resultScore = previousResult.Score || previousResult.score || 0;
    const totalQuestions = previousResult.TotalQuestions || previousResult.totalQuestions || questions.length;
    const percentage = Math.round((resultScore / totalQuestions) * 100);
    setScore({ total: resultScore, max: totalQuestions, percentage });
  };

  const handleRetakeQuiz = () => {
    setShowRetakeDialog(false);
    setViewMode('retake');
    setAnswers({});
    setScore(null);
  };

  const handleStartNewQuiz = () => {
    setShowRetakeDialog(false);
    setViewMode('new');
  };

  const scrollToQuestion = (questionId) => {
    questionRefs.current[questionId]?.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  };

  const handleSubmit = async () => {
    if (window.confirm("Bạn có chắc muốn nộp bài?")) {
      let total = 0;
      questions.forEach((q) => {
        if (answers[q.questionId] === q.correctAnswer) total++;
      });
      const resultScore = total;
      const percentage = Math.round((resultScore / questions.length) * 100);

      setScore({ total: resultScore, max: questions.length, percentage });
      setOpenResultDialog(true);

      // Save quiz result to backend (this will create a new entry, replacing the old one conceptually)
      try {
        const quizResultData = {
          QuizID: parseInt(quizId),
          UserAnswers: JSON.stringify(answers),
          Score: resultScore,
          TotalQuestions: questions.length,
          SubmittedAt: new Date().toISOString(),
        };

        await CreateQuizResult(quizResultData);
        console.log("Quiz result saved successfully");

        // Update progress after saving quiz result
        await UpdateProgress(courseId);
        console.log("Progress updated successfully");
      } catch (err) {
        console.error("Error saving quiz result or updating progress:", err);
      }

      // Save to localStorage - this REPLACES the previous result
      const progressData = JSON.parse(localStorage.getItem("courseProgress")) || {};
      const cid = String(courseId);
      const lid = String(lessonId);

      if (!progressData[cid]) progressData[cid] = {};

      // Overwrite previous result with new result
      progressData[cid][lid] = {
        completed: true,
        score: resultScore,
        total: questions.length,
        answers: answers, // Save answers for review mode
        date: new Date().toISOString(),
        retakeCount: (progressData[cid][lid]?.retakeCount || 0) + 1, // Track number of retakes
      };

      localStorage.setItem("courseProgress", JSON.stringify(progressData));

      // Reset view mode to normal after submission
      setViewMode('new');

      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getAnswerStatus = (questionId) =>
    answers[questionId] !== undefined ? "answered" : "unanswered";

  if (loading) {
    return (
      <>
        <Navbar />
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
          <CircularProgress size={60} />
        </Box>
        <Footer />
      </>
    );
  }

  if (error || !quiz) {
    return (
      <>
        <Navbar />
        <Box textAlign="center" mt={10} px={3}>
          <Alert severity="error" sx={{ mb: 3, maxWidth: 600, mx: "auto" }}>
            {error || "Không tìm thấy bài quiz!"}
          </Alert>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => navigate(`/course/${courseId}/lesson/${lessonId}`)}
          >
            Quay lại bài học
          </Button>
        </Box>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      {/* Retake Dialog */}
      <Dialog
        open={showRetakeDialog}
        onClose={() => setShowRetakeDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: 22 }}>
          Bạn đã hoàn thành quiz này rồi
        </DialogTitle>
        <DialogContent>
          <Box py={2}>
            <Typography variant="body1" mb={2}>
              Bạn đã hoàn thành bài quiz này trước đó với kết quả:
            </Typography>
            <Box
              sx={{
                p: 3,
                backgroundColor: "#f0f9ff",
                borderRadius: 2,
                border: "2px solid #0ea5e9",
                textAlign: "center",
                mb: 2,
              }}
            >
              <Typography variant="h3" fontWeight="bold" color="primary" mb={1}>
                {previousResult?.Score || previousResult?.score || 0}/{previousResult?.TotalQuestions || previousResult?.totalQuestions || questions.length}
              </Typography>
              <Typography variant="h6" color="text.secondary">
                {Math.round(((previousResult?.Score || previousResult?.score || 0) / (previousResult?.TotalQuestions || previousResult?.totalQuestions || questions.length)) * 100)}%
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Bạn có muốn làm lại không?
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={handleViewPreviousResult}
            sx={{ flex: 1 }}
          >
            Xem kết quả
          </Button>
          <Button
            variant="contained"
            onClick={handleRetakeQuiz}
            sx={{ flex: 1 }}
          >
            Có, làm lại
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ display: { xs: "block", md: "flex" }, gap: 3, maxWidth: 1400, mx: "auto", mt: 4, mb: 8, px: 3 }}>
        {/* LEFT SIDE - Questions */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Header */}
          <Paper
            sx={{
              p: 3,
              mb: 3,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              borderRadius: 3,
              boxShadow: 3
            }}
          >
            <Typography variant="h4" fontWeight="700" mb={1}>
              {quiz.Description || quiz.description || "Quiz"}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.95 }}>
              Khóa học {courseId} - Bài học {lessonId}
            </Typography>
          </Paper>

          {/* Result Banner */}
          {score !== null && (
            <Paper
              elevation={3}
              sx={{
                p: 3,
                mb: 3,
                textAlign: "center",
                background: score.percentage >= 70
                  ? "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)"
                  : "linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)",
                borderRadius: 3,
                border: score.percentage >= 70 ? "2px solid #4caf50" : "2px solid #f44336"
              }}
            >
              <Typography variant="h5" fontWeight="bold" color={score.percentage >= 70 ? "#2e7d32" : "#c62828"} mb={1}>
                {score.percentage >= 70 ? "🎉 Xuất sắc!" : "📚 Cần cải thiện"}
              </Typography>
              <Typography variant="h3" fontWeight="bold" color="primary">
                {score.total} / {score.max}
              </Typography>
              <Typography variant="h6" color="text.secondary">
                {score.percentage}%
              </Typography>
            </Paper>
          )}

          {/* Questions */}
          {questions.length === 0 ? (
            <Typography>Không có câu hỏi nào trong bài quiz này.</Typography>
          ) : (
            questions.map((q, index) => {
              const userAnswer = answers[q.questionId];
              const correct = q.correctAnswer;

              return (
                <Card
                  key={q.questionId}
                  ref={(el) => (questionRefs.current[q.questionId] = el)}
                  sx={{
                    mb: 4,
                    borderRadius: 3,
                    boxShadow: 2,
                    border:
                      score !== null
                        ? userAnswer === correct
                          ? "2px solid #4caf50"
                          : "2px solid #e0e0e0"
                        : "1px solid #e0e0e0",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: 4,
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    {/* Question Header */}
                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                      <Typography variant="h6" fontWeight="600" color="primary">
                        Câu {index + 1}
                      </Typography>
                      <Chip
                        label="1 điểm"
                        size="small"
                        color="primary"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    {/* Question Text */}
                    <Typography variant="body1" fontWeight="500" mb={2} color="text.primary">
                      {q.question}
                    </Typography>

                    {/* Multiple Choice Options */}
                    <RadioGroup
                      value={userAnswer ?? ""}
                      onChange={(e) => viewMode !== 'review' && handleAnswer(q.questionId, parseInt(e.target.value))}
                    >
                      {q.options.map((opt, i) => {
                        const isCorrect = i === correct;
                        const isUserAnswer = userAnswer === i;
                        const showResult = viewMode === 'review' || score !== null;

                        return (
                          <Paper
                            key={i}
                            elevation={0}
                            sx={{
                              mb: 1.5,
                              p: 1.5,
                              border: showResult && isCorrect ? "2px solid #4caf50" : showResult && isUserAnswer && !isCorrect ? "2px solid #f44336" : "1px solid #e0e0e0",
                              borderRadius: 2,
                              backgroundColor:
                                showResult && isCorrect ? "#e8f5e9" :
                                  showResult && isUserAnswer && !isCorrect ? "#ffebee" :
                                    userAnswer === i ? "#e3f2fd" : "transparent",
                              transition: "all 0.2s ease",
                              "&:hover": {
                                backgroundColor: viewMode === 'review' ? undefined : "#f5f5f5",
                                borderColor: viewMode === 'review' ? undefined : "#2196f3"
                              }
                            }}
                          >
                            <FormControlLabel
                              value={i}
                              control={<Radio />}
                              label={
                                <Typography variant="body1">
                                  {opt}
                                  {showResult && isCorrect && " ✓"}
                                  {showResult && isUserAnswer && !isCorrect && " ✗"}
                                </Typography>
                              }
                              disabled={viewMode === 'review' || score !== null}
                              sx={{ width: "100%", m: 0 }}
                            />
                          </Paper>
                        );
                      })}
                    </RadioGroup>

                    {/* Answer Feedback */}
                    {(score !== null || viewMode === 'review') && (
                      <Paper
                        elevation={0}
                        sx={{
                          mt: 2,
                          p: 2,
                          backgroundColor: userAnswer === correct ? "#e8f5e9" : "#ffebee",
                          borderRadius: 2,
                          border: userAnswer === correct ? "1px solid #4caf50" : "1px solid #f44336"
                        }}
                      >
                        <Typography
                          variant="body1"
                          fontWeight="600"
                          sx={{ color: userAnswer === correct ? "#2e7d32" : "#c62828" }}
                        >
                          {userAnswer === correct
                            ? "✅ Chính xác!"
                            : `❌ Không chính xác. Đáp án đúng: ${q.options[correct]}`}
                        </Typography>
                      </Paper>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}

          {/* Action Buttons */}
          <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 4 }}>
            {viewMode === 'review' ? (
              <>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate(`/course/${courseId}/lesson/${lessonId}`)}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    px: 4,
                    fontSize: 16,
                    fontWeight: 700,
                  }}
                >
                  Quay lại bài học
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleRetakeQuiz}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    px: 4,
                    fontSize: 16,
                    fontWeight: 700,
                    backgroundColor: "#4038d2ff",
                    "&:hover": { backgroundColor: "#73169aff" },
                  }}
                >
                  Làm lại quiz
                </Button>
              </>
            ) : score === null ? (
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleSubmit}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  px: 4,
                  fontSize: 16,
                  fontWeight: 700,
                  backgroundColor: "#4038d2ff",
                  "&:hover": { backgroundColor: "#73169aff" },
                }}
              >
                Nộp bài
              </Button>
            ) : (
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate(`/course/${courseId}/lesson/${lessonId}`)}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  px: 4,
                  fontSize: 16,
                  fontWeight: 700,
                  backgroundColor: "#4038d2ff",
                  "&:hover": { backgroundColor: "#73169aff" },
                }}
              >
                Quay lại bài học
              </Button>
            )}
          </Box>
        </Box>

        {/* RIGHT SIDE - Sticky Navigation Panel */}
        <Box sx={{ width: { xs: "100%", md: 400 }, flexShrink: 0, mt: { xs: 4, md: 0 } }}>
          <Paper
            elevation={3}
            sx={{
              position: { xs: "relative", md: "sticky" },
              top: 80,
              p: 3,
              borderRadius: 3,
              maxHeight: "calc(100vh - 100px)",
              overflow: "auto",
            }}
          >
            {/* Title */}
            <Typography variant="h6" fontWeight="700" mb={2} textAlign="center">
              {score === null ? "Danh sách câu hỏi" : "Kết quả bài quiz"}
            </Typography>

            {/* Audio Player */}
            {(quiz.MediaUrl || quiz.mediaUrl) && (
              <Box sx={{ mb: 3, p: 2, backgroundColor: "#fff3e0", borderRadius: 3, border: "2px solid #ff9800" }}>
                <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                  <VolumeUpIcon sx={{ color: "#e65100" }} />
                  <Typography variant="subtitle1" fontWeight="700" color="#e65100">
                    Audio
                  </Typography>
                </Box>
                <audio
                  key={quiz.MediaUrl || quiz.mediaUrl}
                  controls
                  preload="metadata"
                  style={{ width: "100%", borderRadius: 8 }}
                  src={`https://localhost:7264${quiz.MediaUrl || quiz.mediaUrl}`}
                >
                  Your browser does not support the audio element.
                </audio>
              </Box>
            )}

            {/* Question Navigation */}
            <Typography variant="subtitle2" fontWeight="600" mb={2}>
              Câu hỏi
            </Typography>
            <Grid container spacing={1.5}>
              {questions.map((q, index) => {
                const status = getAnswerStatus(q.questionId);
                return (
                  <Grid item xs={3} key={q.questionId}>
                    <Button
                      variant={status === "answered" ? "contained" : "outlined"}
                      color={status === "answered" ? "success" : "default"}
                      onClick={() => scrollToQuestion(q.questionId)}
                      sx={{
                        width: "100%",
                        height: 50,
                        fontWeight: 700,
                        fontSize: 16,
                        borderRadius: 2,
                        transition: "all 0.2s ease",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: 2
                        }
                      }}
                    >
                      {index + 1}
                    </Button>
                  </Grid>
                );
              })}
            </Grid>

            {/* Progress */}
            <Box sx={{ mt: 3, p: 2, backgroundColor: "#e3f2fd", borderRadius: 2 }}>
              <Typography variant="body1" fontWeight="600" color="primary">
                Tiến độ: {Object.keys(answers).length} / {questions.length} câu
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
                  mt: 3,
                  borderRadius: 2,
                  py: 1.5,
                  fontSize: 16,
                  fontWeight: 700,
                  backgroundColor: "#4038d2ff",
                  "&:hover": { backgroundColor: "#73169aff" },
                }}
              >
                Nộp bài
              </Button>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Result Dialog */}
      <Dialog
        open={openResultDialog}
        onClose={() => setOpenResultDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box textAlign="center">
            {score?.percentage >= 70 ? "🎉 Hoàn thành!" : "📚 Cần luyện tập thêm"}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box
            textAlign="center"
            py={4}
            px={2}
            sx={{
              background: score?.percentage >= 70
                ? "linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)"
                : "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)",
              borderRadius: 3,
              boxShadow: 3,
            }}
          >
            <Typography variant="h2" fontWeight="bold" color="primary" mb={2}>
              {score?.percentage}%
            </Typography>
            <Typography variant="h5" mb={1}>
              Điểm: {score?.total} / {score?.max}
            </Typography>

            <Typography variant="body1" color="text.secondary" mb={2}>
              {score?.percentage >= 70
                ? "Chúc mừng! Bạn đã hoàn thành tốt bài quiz này."
                : "Hãy xem lại các câu sai và thử lại nhé!"}
            </Typography>

            <Chip
              label={score?.percentage >= 70 ? "Đạt" : "Chưa đạt"}
              color={score?.percentage >= 70 ? "success" : "warning"}
              size="large"
              sx={{ fontSize: 16, py: 1, px: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", mb: 2 }}>
          <Button
            variant="contained"
            onClick={() => navigate(`/course/${courseId}/lesson/${lessonId}`)}
            sx={{ mx: 1 }}
          >
            Quay lại bài học
          </Button>
          <Button
            variant="outlined"
            onClick={() => setOpenResultDialog(false)}
            sx={{ mx: 1 }}
          >
            Xem lại đáp án
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </>
  );
}