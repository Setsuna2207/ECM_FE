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
  Divider,
  Alert,
} from "@mui/material";
import ArticleIcon from "@mui/icons-material/Article";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { GetPlacementTestById } from "../../services/placementTestService";

export default function TestDetailPage() {
  const { testId } = useParams();
  const [test, setTest] = useState(null);
  const [allQuestions, setAllQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [listenCount, setListenCount] = useState(0);
  const [isForcedSubmit, setIsForcedSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openResultDialog, setOpenResultDialog] = useState(false);
  const navigate = useNavigate();

  const questionRefs = useRef({});
  const audioRef = useRef(null);

  // Load test data from backend
  useEffect(() => {
    const fetchTest = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await GetPlacementTestById(testId);
        const testData = response.data || response.Data;

        if (!testData) {
          setError("Không tìm thấy bài kiểm tra");
          setLoading(false);
          return;
        }

        // Parse sections if stored as JSON string
        let sections = testData.sections;
        if (typeof sections === 'string') {
          sections = JSON.parse(sections);
        }

        // Transform test data
        const transformedTest = {
          testId: testData.testID || testData.testId,
          title: testData.title,
          description: testData.description,
          category: testData.category,
          level: testData.level,
          duration: testData.duration,
          totalQuestions: testData.totalQuestions,
          mediaURL: testData.mediaURL || testData.mediaUrl,
          sections: sections || [],
        };

        setTest(transformedTest);

        // Flatten questions from all sections
        const questions = [];
        transformedTest.sections.forEach((section) => {
          // Parse questions if stored as JSON string
          let sectionQuestions = section.questions;
          if (typeof sectionQuestions === 'string') {
            sectionQuestions = JSON.parse(sectionQuestions);
          }

          sectionQuestions.forEach((q) => {
            questions.push({
              ...q,
              sectionTitle: section.title,
              sectionId: section.sectionId
            });
          });
        });

        setAllQuestions(questions);
        setTimeRemaining(transformedTest.duration * 60);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching test:", err);
        setError("Không thể tải bài kiểm tra. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    fetchTest();
  }, [testId]);

  // Timer countdown
  useEffect(() => {
    if (!hasStarted || timeRemaining === null || timeRemaining <= 0 || score !== null) return;
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [hasStarted, timeRemaining, score]);

  // Anti-cheat: detect tab change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && score === null && !isSubmitting) {
        alert("Bài thi đã bị hủy do thao tác ngoài tab!");
        setIsForcedSubmit(true);
        navigate("/tests");
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [score, isSubmitting, navigate]);

  const startTest = () => {
    if (!hasStarted) setHasStarted(true);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswer = (questionId, answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    startTest();
  };

  const scrollToQuestion = (questionId) => {
    questionRefs.current[questionId]?.scrollIntoView({ behavior: "smooth", block: "center" });
    startTest();
  };

  const handleSubmit = (forceSubmit = false) => {
    if (forceSubmit) {
      setIsForcedSubmit(true);
      navigate("/tests");
      return;
    }

    if (!window.confirm("Bạn có chắc muốn nộp bài?")) return;

    setIsSubmitting(true);

    let totalScore = 0;
    let maxScore = 0;

    allQuestions.forEach((q) => {
      maxScore += q.points || 2;

      if (q.type === "multiple-choice") {
        if (answers[q.questionId] === q.correctAnswer) {
          totalScore += q.points || 2;
        }
      }
      else if (q.type === "sentence-completion") {
        // For fill-in-the-blank questions
        const userAnswer = (answers[q.questionId] || "").toLowerCase().trim();
        const correctAnswer = (q.sampleAnswer || q.correctAnswer || "").toLowerCase().trim();

        // Remove extra spaces and compare
        const normalizedUser = userAnswer.replace(/\s+/g, " ");
        const normalizedCorrect = correctAnswer.replace(/\s+/g, " ");

        // Check if answers match (allow some flexibility)
        if (normalizedUser === normalizedCorrect) {
          totalScore += q.points || 2;
        } else {
          // Partial credit if user got some words right
          const userWords = normalizedUser.split(/[,\s]+/).filter(w => w);
          const correctWords = normalizedCorrect.split(/[,\s]+/).filter(w => w);

          let correctCount = 0;
          userWords.forEach(word => {
            if (correctWords.includes(word)) correctCount++;
          });

          // Give partial credit based on correct words
          if (correctCount > 0 && correctWords.length > 0) {
            totalScore += (q.points || 2) * (correctCount / correctWords.length);
          }
        }
      }
      else if (q.type === "error-correction") {
        // For error correction, check if answer is provided
        const userAnswer = (answers[q.questionId] || "").toLowerCase().trim();
        const correctAnswer = (q.correctAnswer || "").toLowerCase().trim();

        if (userAnswer && correctAnswer) {
          // Simple comparison (can be made more sophisticated)
          if (userAnswer === correctAnswer) {
            totalScore += q.points || 2;
          } else {
            // Partial credit if answer is reasonably close
            const similarity = calculateSimilarity(userAnswer, correctAnswer);
            if (similarity > 0.7) {
              totalScore += (q.points || 2) * similarity;
            }
          }
        }
      }
      else if (q.type === "essay" || q.type === "short-response") {
        if (answers[q.questionId] && answers[q.questionId].trim().length > 0) {
          totalScore += (q.points || 5) * 0.7; // 70% credit for completion
        }
      }
    });

    const percentage = Math.round((totalScore / maxScore) * 100);
    setScore({ total: totalScore, max: maxScore, percentage });
    setIsSubmitting(false);
    setOpenResultDialog(true);

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
  };

  // Helper function to calculate string similarity
  const calculateSimilarity = (str1, str2) => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = getEditDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  };

  const getEditDistance = (str1, str2) => {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  };

  const getAnswerStatus = (questionId) => (answers[questionId] !== undefined ? "answered" : "unanswered");

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

  if (error || !test) {
    return (
      <>
        <Navbar />
        <Box textAlign="center" mt={10} px={3}>
          <Alert severity="error" sx={{ maxWidth: 600, mx: "auto", mb: 3 }}>
            {error || "Không tìm thấy bài kiểm tra!"}
          </Alert>
          <Button variant="contained" onClick={() => navigate("/tests")}>
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
      <Box sx={{ display: { xs: "block", md: "flex" }, gap: 3, maxWidth: 1400, mx: "auto", mt: 4, mb: 8, px: 3 }}>
        {/* LEFT SIDE - Questions */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {test.title}
          </Typography>
          <Typography variant="body1" color="text.primary" mb={1}>
            {test.description} <br />
            Bài kiểm tra sẽ tính giờ khi bạn bắt đầu trả lời câu hỏi hoặc nghe audio.
            Khi hết thời gian, bài kiểm tra sẽ tự động nộp. <br />
            Lưu ý: Audio chỉ được nghe tối đa 2 lần trong suốt quá trình làm bài. Bài thi sẽ bị hủy nếu bạn chuyển tab trình duyệt.
          </Typography>

          {test.sections.map((section) => (
            <Box key={section.sectionId} mb={4}>
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
                <Typography variant="h5" fontWeight="700" mb={1}>
                  {section.title}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.95 }}>
                  {section.description}
                </Typography>
              </Paper>

              {section.questions.map((q) => (
                <Card
                  key={q.questionId}
                  ref={(el) => (questionRefs.current[q.questionId] = el)}
                  sx={{
                    mb: 4,
                    borderRadius: 3,
                    boxShadow: 2,
                    border:
                      score !== null && !isForcedSubmit
                        ? q.type === "multiple-choice" && answers[q.questionId] === q.correctAnswer
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
                        Câu {q.questionId}
                      </Typography>
                      <Chip
                        label={`${q.points} điểm`}
                        size="small"
                        color="primary"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>

                    {/* Passage - Improved UI */}
                    {q.passage && (
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          mb: 3,
                          backgroundColor: "#f8f9fa",
                          border: "2px solid #e3f2fd",
                          borderLeft: "5px solid #2196f3",
                          borderRadius: 2,
                          position: "relative"
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 2,
                            pb: 1.5,
                            borderBottom: "1px solid #e0e0e0"
                          }}
                        >
                          <ArticleIcon sx={{ color: "#2196f3", fontSize: 24 }} />
                          <Typography
                            variant="subtitle2"
                            fontWeight="700"
                            color="primary"
                            sx={{ textTransform: "uppercase", letterSpacing: 1 }}
                          >
                            Reading Passage
                          </Typography>
                        </Box>
                        <Typography
                          variant="body1"
                          sx={{
                            lineHeight: 1.8,
                            color: "#2c3e50",
                            fontSize: "1rem",
                            whiteSpace: "pre-line",
                            fontFamily: "'Georgia', serif"
                          }}
                        >
                          {q.passage}
                        </Typography>
                      </Paper>
                    )}

                    <Divider sx={{ mb: 2 }} />

                    {/* Question Text */}
                    <Typography variant="body1" fontWeight="500" mb={2} color="text.primary">
                      {q.question}
                    </Typography>

                    {/* Multiple Choice Options */}
                    {q.type === "multiple-choice" && (
                      <RadioGroup
                        value={answers[q.questionId] ?? ""}
                        onChange={(e) => handleAnswer(q.questionId, parseInt(e.target.value))}
                      >
                        {q.options.map((opt, i) => (
                          <Paper
                            key={i}
                            elevation={0}
                            sx={{
                              mb: 1.5,
                              p: 1.5,
                              border: "1px solid #e0e0e0",
                              borderRadius: 2,
                              backgroundColor:
                                answers[q.questionId] === i
                                  ? "#e3f2fd"
                                  : "transparent",
                              transition: "all 0.2s ease",
                              "&:hover": {
                                backgroundColor: "#f5f5f5",
                                borderColor: "#2196f3"
                              }
                            }}
                          >
                            <FormControlLabel
                              value={i}
                              control={<Radio />}
                              label={
                                <Typography variant="body1">
                                  {opt}
                                </Typography>
                              }
                              disabled={score !== null}
                              sx={{ width: "100%", m: 0 }}
                            />
                          </Paper>
                        ))}
                      </RadioGroup>
                    )}

                    {/* Sentence Completion */}
                    {q.type === "sentence-completion" && (
                      <TextField
                        fullWidth
                        placeholder="Điền câu trả lời dưới dạng: ..., ..., ..."
                        value={answers[q.questionId] || ""}
                        onChange={(e) => handleAnswer(q.questionId, e.target.value)}
                        disabled={score !== null}
                        sx={{
                          mt: 1,
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2
                          }
                        }}
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
                        sx={{
                          mt: 1,
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2
                          }
                        }}
                      />
                    )}

                    {/* Essay/Short Response */}
                    {(q.type === "essay" || q.type === "short-response") && (
                      <TextField
                        fullWidth
                        multiline
                        rows={q.type === "essay" ? 6 : 3}
                        placeholder={`Viết câu trả lời (${q.minWords}-${q.maxWords} từ)...`}
                        value={answers[q.questionId] || ""}
                        onChange={(e) => handleAnswer(q.questionId, e.target.value)}
                        disabled={score !== null}
                        sx={{
                          mt: 1,
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2
                          }
                        }}
                      />
                    )}

                    {/* Answer Feedback */}
                    {score !== null && !isForcedSubmit && (
                      <>
                        {q.type === "multiple-choice" && (
                          <Paper
                            elevation={0}
                            sx={{
                              mt: 2,
                              p: 2,
                              backgroundColor: answers[q.questionId] === q.correctAnswer ? "#e8f5e9" : "#ffebee",
                              borderRadius: 2,
                              border: answers[q.questionId] === q.correctAnswer ? "1px solid #4caf50" : "1px solid #f44336"
                            }}
                          >
                            <Typography
                              variant="body1"
                              fontWeight="600"
                              sx={{ color: answers[q.questionId] === q.correctAnswer ? "#2e7d32" : "#c62828" }}
                            >
                              {answers[q.questionId] === q.correctAnswer
                                ? "✅ Chính xác!"
                                : `❌ Không chính xác. Đáp án đúng: ${q.options[q.correctAnswer]}`}
                            </Typography>
                          </Paper>
                        )}

                        {q.type === "sentence-completion" && (
                          <Paper
                            elevation={0}
                            sx={{
                              mt: 2,
                              p: 2,
                              backgroundColor: "#e3f2fd",
                              borderRadius: 2,
                              border: "1px solid #2196f3"
                            }}
                          >
                            <Typography variant="body2" fontWeight="600" color="primary" mb={1}>
                              📝 Đáp án mẫu:
                            </Typography>
                            <Typography variant="body1">
                              {q.sampleAnswer || q.correctAnswer}
                            </Typography>
                            {answers[q.questionId] && (
                              <>
                                <Typography variant="body2" fontWeight="600" color="text.secondary" mt={1} mb={0.5}>
                                  Câu trả lời của bạn:
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                  {answers[q.questionId]}
                                </Typography>
                              </>
                            )}
                          </Paper>
                        )}

                        {q.type === "error-correction" && (
                          <Paper
                            elevation={0}
                            sx={{
                              mt: 2,
                              p: 2,
                              backgroundColor: "#e3f2fd",
                              borderRadius: 2,
                              border: "1px solid #2196f3"
                            }}
                          >
                            <Typography variant="body2" fontWeight="600" color="primary" mb={1}>
                              📝 Đáp án đúng:
                            </Typography>
                            <Typography variant="body1">
                              {q.correctAnswer}
                            </Typography>
                            {answers[q.questionId] && (
                              <>
                                <Typography variant="body2" fontWeight="600" color="text.secondary" mt={1} mb={0.5}>
                                  Câu trả lời của bạn:
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                  {answers[q.questionId]}
                                </Typography>
                              </>
                            )}
                          </Paper>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          ))}
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
            {/* Sticky Navigation Title */}
            <Typography variant="h6" fontWeight="700" mb={2} textAlign="center">
              {score === null ? "Danh sách câu hỏi" : "Kết quả bài thi"}
            </Typography>

            {/* Timer */}
            {score === null && (
              <Box sx={{ mb: 3, p: 2, backgroundColor: "#f5f5f5", borderRadius: 3, textAlign: "center" }}>
                <Typography variant="subtitle1" fontWeight="600" mb={1}>
                  ⏱️ Thời gian còn lại
                </Typography>
                <Typography variant="h3" color={timeRemaining < 300 ? "error" : "primary"} fontWeight="bold">
                  {formatTime(timeRemaining)}
                </Typography>
              </Box>
            )}

            {/* Audio Player - Check if test or any section has audio */}
            {(() => {
              // Check test-level media URL first
              let audioUrl = test?.mediaURL;

              // If no test-level media, check sections
              if (!audioUrl) {
                const sectionWithMedia = test?.sections?.find(s => s.mediaUrl || s.MediaURL);
                audioUrl = sectionWithMedia?.mediaUrl || sectionWithMedia?.MediaURL;
              }

              // Construct full media URL if it's a relative path
              let fullAudioUrl = audioUrl;
              if (audioUrl && !audioUrl.startsWith('http')) {
                const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'https://localhost:7264';
                fullAudioUrl = `${baseUrl}${audioUrl.startsWith('/') ? '' : '/'}${audioUrl}`;
              }

              console.log("Audio URL:", audioUrl);
              console.log("Full Audio URL:", fullAudioUrl);

              return audioUrl && fullAudioUrl && score === null ? (
                <Box sx={{ mb: 3, p: 2, backgroundColor: "#fff3e0", borderRadius: 3, border: "2px solid #ff9800" }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
                    <Typography variant="subtitle1" fontWeight="700" color="#e65100">
                      🎧 Audio Listening
                    </Typography>
                    <Chip
                      label={`${listenCount}/2 lần`}
                      size="small"
                      color={listenCount >= 2 ? "error" : "warning"}
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                  <audio
                    ref={audioRef}
                    controls
                    style={{ width: "100%", borderRadius: 8 }}
                    onPlay={() => {
                      if (listenCount < 2) {
                        setListenCount(prev => prev + 1);
                        startTest();
                      } else {
                        if (audioRef.current) {
                          audioRef.current.pause();
                          audioRef.current.currentTime = 0;
                        }
                        alert("Bạn đã nghe đủ 2 lần!");
                      }
                    }}
                    onError={(e) => {
                      console.error("Audio error:", e);
                      console.error("Audio URL:", fullAudioUrl);
                    }}
                  >
                    <source src={fullAudioUrl} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                  <Typography variant="caption" color="text.secondary" display="block" mt={1} textAlign="center">
                    Lưu ý: Chỉ được nghe tối đa 2 lần
                  </Typography>
                </Box>
              ) : null;
            })()}

            {/* Question Navigation */}
            <Typography variant="subtitle2" fontWeight="600" mb={2}>
              Câu hỏi
            </Typography>
            <Grid container spacing={1.5}>
              {allQuestions.map((q) => {
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
                      {q.questionId}
                    </Button>
                  </Grid>
                );
              })}
            </Grid>

            {/* Progress */}
            {score === null && (
              <Box sx={{ mt: 3, p: 2, backgroundColor: "#e3f2fd", borderRadius: 2 }}>
                <Typography variant="body1" fontWeight="600" color="primary">
                  Tiến độ: {Object.keys(answers).length} / {allQuestions.length} câu
                </Typography>
              </Box>
            )}

            {/* Submit */}
            {score === null && (
              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                onClick={() => handleSubmit()}
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

            {/* Return Button */}
            {score !== null && (
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                size="large"
                onClick={() => navigate("/tests")}
                sx={{
                  mt: 2,
                  borderRadius: 2,
                  py: 1.5,
                  fontSize: 16,
                  fontWeight: 700,
                  backgroundColor: "#4038d2ff",
                  "&:hover": { backgroundColor: "#73169aff" },
                }}
              >
                Trở về
              </Button>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Result Dialog */}
      <Dialog open={openResultDialog} onClose={() => setOpenResultDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box textAlign="center">
            {score?.percentage >= 85 ? "🌟 Xuất sắc!" : score?.percentage >= 70 ? "👍 Khá tốt" : "⚠️ Cần cải thiện"}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box
            textAlign="center"
            py={4}
            px={2}
            sx={{
              background: "linear-gradient(135deg, #e0f7fa 0%, #e1bee7 100%)",
              borderRadius: 3,
              boxShadow: 3,
            }}
          >
            <Typography variant="h2" fontWeight="bold" color="primary" mb={2}>
              {score?.percentage}%
            </Typography>
            <Typography variant="h5" mb={1}>
              Điểm: {score?.total?.toFixed(1)} / {score?.max}
            </Typography>

            <Typography variant="body1" color="text.secondary" mb={2}>
              {score?.percentage >= 85
                ? "Bạn làm bài rất tốt, tiếp tục phát huy!"
                : score?.percentage >= 70
                  ? "Bạn làm khá tốt, còn một chút cải thiện là ổn."
                  : "Bạn nên ôn tập lại và thử lại lần sau."}
            </Typography>

            <Chip
              label={score?.percentage >= 85 ? "Xuất sắc" : score?.percentage >= 70 ? "Khá" : "Cần cải thiện"}
              color={score?.percentage >= 85 ? "success" : score?.percentage >= 70 ? "warning" : "error"}
              size="large"
              sx={{ fontSize: 16, py: 1, px: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", mb: 2 }}>
          <Button variant="contained" onClick={() => navigate("/tests")} sx={{ mx: 1 }}>
            Về danh sách bài kiểm tra
          </Button>
          <Button variant="outlined" onClick={() => setOpenResultDialog(false)} sx={{ mx: 1 }}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </>
  );
}