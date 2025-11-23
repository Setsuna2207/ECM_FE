import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import { mockQuizzes } from "../data/mockQuiz";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function QuizPage() {
  const { courseId, lessonId, quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const selectedQuiz = mockQuizzes.find(
      (q) =>
        q.quizId === parseInt(quizId) &&
        q.lessonId === parseInt(lessonId) &&
        q.courseId === parseInt(courseId)
    );

    if (!selectedQuiz) {
      setLoading(false);
      return;
    }

    setQuiz(selectedQuiz);

    // ✅ Load file câu hỏi
    const quizModules = import.meta.glob("../data/quiz/*.js");
    const filePath = selectedQuiz.questionFileUrl;

    if (quizModules[filePath]) {
      quizModules[filePath]()
        .then((module) => {
          setQuestions(module.default?.questions || []);
        })
        .catch((err) => console.error("Không thể load file câu hỏi:", err))
        .finally(() => setLoading(false));
    } else {
      console.error("Không tìm thấy file quiz:", filePath);
      setLoading(false);
    }
  }, [quizId, lessonId, courseId]);

  const handleAnswer = (questionId, choice) => {
    setAnswers((prev) => ({ ...prev, [questionId]: choice }));
  };

  const handleSubmit = () => {
    if (window.confirm("Bạn có chắc muốn nộp bài?")) {
      let total = 0;
      questions.forEach((q) => {
        if (answers[q.questionId] === q.correctAnswer) total++;
      });
      const resultScore = total;
      setScore(resultScore);

      // ✅ Lưu tiến độ vào localStorage
      const progressData =
        JSON.parse(localStorage.getItem("courseProgress")) || {};
      const cid = String(courseId);
      const lid = String(lessonId);

      if (!progressData[cid]) progressData[cid] = {};
      progressData[cid][lid] = {
        completed: true,
        score: resultScore,
        total: questions.length,
        date: new Date().toISOString(),
      };

      localStorage.setItem("courseProgress", JSON.stringify(progressData));

      // ✅ Scroll lên đầu trang để xem kết quả
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );

  if (!quiz)
    return (
      <Box textAlign="center" mt={10}>
        <Typography variant="h5">
          Không tìm thấy bài quiz cho bài học này!
        </Typography>
      </Box>
    );

  return (
    <>
      <Navbar />

      {/* 🟢 Floating audio player cố định DƯỚI TRANG */}
      {quiz.mediaUrl && (
        <Paper
          elevation={8}
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1200,
            p: 1.5,
            backgroundColor: "#fff",
            borderTop: "1px solid #ccc",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <audio
            controls
            style={{
              width: "80%",
              borderRadius: "8px",
            }}
          >
            <source src={quiz.mediaUrl} type="audio/mpeg" />
            Trình duyệt của bạn không hỗ trợ phát âm thanh.
          </audio>
        </Paper>
      )}

      {/* Nội dung quiz */}
      <Box sx={{ maxWidth: 800, mx: "auto", mt: 6, mb: 12 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {quiz.title}
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={3}>
          Khóa học {courseId} - Bài học {lessonId}
        </Typography>

        {/* Nếu đã nộp bài → hiện kết quả */}
        {score !== null && (
          <Box
            sx={{
              p: 2,
              border: "2px solid #6C63FF",
              borderRadius: 2,
              mb: 3,
              textAlign: "center",
              backgroundColor: "#f8f7ff",
            }}
          >
            <Typography variant="h5" fontWeight="bold" color="#4038d2ff">
              🎯 Kết quả: {score} / {questions.length}
            </Typography>
          </Box>
        )}

        {questions.length === 0 ? (
          <Typography>Không có câu hỏi nào trong bài quiz này.</Typography>
        ) : (
          questions.map((q, index) => {
            const userAnswer = answers[q.questionId];
            const correct = q.correctAnswer;

            return (
              <Card
                key={q.questionId}
                sx={{
                  mb: 3,
                  p: 2,
                  borderRadius: 2,
                  border:
                    score !== null
                      ? userAnswer === correct
                        ? "2px solid #4caf50"
                        : "2px solid #f44336"
                      : "1px solid #ddd",
                  backgroundColor:
                    score !== null && userAnswer === correct
                      ? "#e8f5e9"
                      : score !== null
                      ? "#ffebee"
                      : "#fff",
                }}
              >
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                    Câu {index + 1}: {q.question}
                  </Typography>

                  <RadioGroup
                    value={userAnswer ?? ""}
                    onChange={(e) =>
                      handleAnswer(q.questionId, parseInt(e.target.value))
                    }
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

                  {score !== null && (
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 1,
                        color:
                          userAnswer === correct ? "green" : "error.main",
                      }}
                    >
                      {userAnswer === correct
                        ? "✅ Đúng"
                        : `❌ Sai (Đáp án đúng: ${q.options[correct]})`}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}

        {score === null ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              sx={{
                borderRadius: 3,
                backgroundColor: "#4038d2ff",
                "&:hover": { backgroundColor: "#73169aff" },
              }}
            >
              Nộp bài
            </Button>
          </Box>
        ) : (
          <Box textAlign="center" mt={3}>
            <Button
              variant="outlined"
              sx={{ mt: 2 }}
              onClick={() =>
                navigate(`/course/${courseId}/lesson/${lessonId}`)
              }
            >
              Quay lại bài học
            </Button>
          </Box>
        )}
      </Box>

      <Footer />
    </>
  );
}
