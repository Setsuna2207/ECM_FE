import { useEffect, useState } from "react";
import { recommendTest } from "../services/ai.service";
import { useNavigate } from "react-router-dom";

const TestRcmPage = () => {
  const [loading, setLoading] = useState(true);
  const [suggestion, setSuggestion] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSuggestion = async () => {
      try {
        const res = await recommendTest();
        setSuggestion(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestion();
  }, []);

  if (loading) return <p>Đang phân tích mục tiêu học tập...</p>;

  if (!suggestion) return <p>Không có gợi ý phù hợp.</p>;

  return (
    <div>
      <h2>🎯 Test được đề xuất cho bạn</h2>

      <h3>{suggestion.testTitle}</h3>
      <p>{suggestion.reason}</p>

      <button onClick={() => navigate(`/tests/${suggestion.testId}`)}>
        Làm bài test này
      </button>
    </div>
  );
};

export default TestRcmPage;
