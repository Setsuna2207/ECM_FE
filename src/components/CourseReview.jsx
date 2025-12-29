import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Rating,
  IconButton,
  Button,
  TextField,
  Paper,
  CircularProgress,
  Alert,
  Avatar,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import {
  GetReviewByCourseId,
  CreateReview,
  UpdateReview,
  DeleteReview,
} from "../services/reviewService";

export default function CourseReview({ courseId }) {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [newRating, setNewRating] = useState(0);
  const [newContent, setNewContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {};
  const currentUserId = currentUser.userID || currentUser.id;
  const currentUserRole = currentUser.roles || currentUser.role || "user";

  const [isEditing, setIsEditing] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const reviewsRes = await GetReviewByCourseId(courseId);
      const reviewsData = reviewsRes.data || [];

      console.log("Reviews data:", reviewsData);

      // Sort reviews: current user's review first, then others
      const sortedReviews = reviewsData.sort((a, b) => {
        const aUserId = a.userID || a.userId;
        const bUserId = b.userID || b.userId;

        if (aUserId === currentUserId) return -1;
        if (bUserId === currentUserId) return 1;
        return 0;
      });

      setReviews(sortedReviews);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Lỗi khi tải đánh giá");
    } finally {
      setLoading(false);
    }
  };

  const getUserInfo = (review) => {
    // Use data directly from review (backend now includes FullName and Avatar)
    return {
      fullName: review.FullName || review.fullName || review.UserName || review.userName || `Người dùng #${review.userID}`,
      avatar: review.Avatar || review.avatar || ""
    };
  };

  useEffect(() => {
    if (reviews.length > 0) {
      const avg = (
        reviews.reduce((sum, r) => sum + (r.reviewScore || r.ratingScore || 0), 0) / reviews.length
      ).toFixed(1);
      setAverageRating(parseFloat(avg));
    } else {
      setAverageRating(0);
    }
  }, [reviews]);

  const handleSubmit = async () => {
    if (!newContent.trim() || newRating === 0) return;

    try {
      setSubmitting(true);
      setError(null);

      if (isEditing) {
        await UpdateReview(editingReview.userID || editingReview.userId, editingReview.courseID || editingReview.courseId, {
          reviewScore: newRating,
          reviewContent: newContent,
        });
        const updated = reviews.map((r) =>
          (r.userID || r.userId) === (editingReview.userID || editingReview.userId) &&
            (r.courseID || r.courseId) === (editingReview.courseID || editingReview.courseId)
            ? {
              ...r,
              reviewScore: newRating,
              reviewContent: newContent,
              createdAt: new Date().toISOString(),
            }
            : r
        );
        setReviews(updated);
        setIsEditing(false);
        setEditingReview(null);
      } else {
        const response = await CreateReview({
          userID: currentUserId,
          courseID: parseInt(courseId, 10),
          reviewScore: newRating,
          reviewContent: newContent,
        });
        // Add new review and re-sort to put it at the top
        const newReviews = [response.data, ...reviews];
        setReviews(newReviews);
      }

      setNewContent("");
      setNewRating(0);
    } catch (err) {
      console.error("Error submitting review:", err);
      setError("Lỗi khi lưu đánh giá");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (review) => {
    if (window.confirm("Bạn có chắc muốn xóa đánh giá này không?")) {
      try {
        const userId = review.userID || review.userId;
        const courseIdVal = review.courseID || review.courseId;
        await DeleteReview(userId, courseIdVal);
        setReviews(reviews.filter((r) =>
          (r.userID || r.userId) !== userId || (r.courseID || r.courseId) !== courseIdVal
        ));
      } catch (err) {
        console.error("Error deleting review:", err);
        setError("Lỗi khi xóa đánh giá");
      }
    }
  };

  const handleEdit = (review) => {
    setNewRating(review.reviewScore || review.ratingScore || 0);
    setNewContent(review.reviewContent || review.ratingContent || "");
    setIsEditing(true);
    setEditingReview(review);
  };

  return (
    <Box sx={{ mt: 1 }}>
      {/* Tiêu đề + điểm trung bình */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={3}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="h5" fontWeight="bold">
            Đánh giá khóa học
          </Typography>
          <Rating value={averageRating} readOnly precision={0.5} />
          <Typography variant="body1" color="text.secondary">
            ({averageRating} / 5 từ {reviews.length} đánh giá)
          </Typography>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Form thêm/chỉnh sửa */}
          <Paper
            elevation={2}
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 3,
              backgroundColor: "#f9f9ff",
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold" mb={1}>
              {isEditing ? "Chỉnh sửa đánh giá của bạn" : "Viết đánh giá mới"}
            </Typography>

            <Rating
              value={newRating}
              onChange={(_, value) => setNewRating(value)}
              precision={1}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Chia sẻ cảm nhận của bạn..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              endIcon={<SendIcon />}
              onClick={handleSubmit}
              disabled={submitting}
              sx={{
                backgroundColor: "#6C63FF",
                "&:hover": { backgroundColor: "#574bff" },
                borderRadius: 2,
                textTransform: "none",
              }}
            >
              {submitting ? "Đang lưu..." : isEditing ? "Cập nhật" : "Gửi đánh giá"}
            </Button>
          </Paper>

          {/* Danh sách đánh giá */}
          {reviews.length > 0 ? (
            reviews.map((r, idx) => {
              const reviewUserId = r.userID || r.userId;
              const isOwner = reviewUserId === currentUserId;
              const isAdmin = currentUserRole === "admin" || currentUserRole === "Admin";
              const userInfo = getUserInfo(r);

              return (
                <Paper
                  key={idx}
                  elevation={1}
                  sx={{
                    p: 2.5,
                    mb: 2,
                    borderRadius: 2,
                    backgroundColor: "#fff",
                    border: "1px solid #eee",
                  }}
                >
                  {/* Dòng đầu tiên */}
                  <Box display="flex" justifyContent="space-between">
                    <Box display="flex" gap={2} alignItems="flex-start">
                      {/* Avatar */}
                      <Avatar
                        src={userInfo.avatar}
                        alt={userInfo.fullName}
                        sx={{ width: 48, height: 48 }}
                      >
                        {!userInfo.avatar && userInfo.fullName.charAt(0)}
                      </Avatar>

                      {/* User info and rating */}
                      <Box>
                        <Typography fontWeight="bold">
                          {userInfo.fullName}
                        </Typography>

                        <Rating
                          value={r.reviewScore || r.ratingScore || 0}
                          readOnly
                          precision={0.5}
                          size="small"
                        />

                        <Typography variant="body2" color="text.secondary">
                          {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Nút hành động */}
                    <Box>
                      {isOwner && (
                        <>
                          <IconButton onClick={() => handleEdit(r)} color="primary">
                            <EditIcon />
                          </IconButton>

                          <IconButton
                            onClick={() => handleDelete(r)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </>
                      )}

                      {!isOwner && isAdmin && (
                        <IconButton
                          onClick={() => handleDelete(r)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>
                  </Box>

                  {/* Nội dung */}
                  <Typography sx={{ mt: 1.5, ml: 8, lineHeight: 1.6 }}>
                    {r.reviewContent || r.ratingContent}
                  </Typography>
                </Paper>
              );
            })
          ) : (
            <Typography color="text.secondary">
              Chưa có đánh giá nào cho khóa học này.
            </Typography>
          )}
        </>
      )}
    </Box>
  );
}