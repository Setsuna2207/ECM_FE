import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Rating,
  IconButton,
  Button,
  TextField,
  Paper,
  Avatar,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import { mockReviews } from "../data/mockReview";

export default function CourseReview({ courseId }) {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [newRating, setNewRating] = useState(0);
  const [newContent, setNewContent] = useState("");

  //  GIẢ LẬP USER LOGIN 
  const [currentUserId] = useState(1);
  const [currentUserRole] = useState("admin");

  const [isEditing, setIsEditing] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  useEffect(() => {
    const filtered = mockReviews.filter(
      (r) => r.courseId === parseInt(courseId, 10)
    );
    setReviews(filtered);
  }, [courseId]);

  useEffect(() => {
    if (reviews.length > 0) {
      const avg = (
        reviews.reduce((sum, r) => sum + r.ratingScore, 0) / reviews.length
      ).toFixed(1);
      setAverageRating(parseFloat(avg));
    } else {
      setAverageRating(0);
    }
  }, [reviews]);

  const handleSubmit = () => {
    if (!newContent.trim() || newRating === 0) return;

    if (isEditing) {
      const updated = reviews.map((r) =>
        r.userId === editingReview.userId &&
        r.courseId === editingReview.courseId
          ? {
              ...r,
              ratingScore: newRating,
              ratingContent: newContent,
              createdAt: new Date().toISOString(),
            }
          : r
      );
      setReviews(updated);
      setIsEditing(false);
      setEditingReview(null);
    } else {
      const newReview = {
        userId: currentUserId,
        courseId: parseInt(courseId, 10),
        ratingScore: newRating,
        ratingContent: newContent,
        createdAt: new Date().toISOString(),
        avatar:
          "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
      };
      setReviews([newReview, ...reviews]);
    }

    setNewContent("");
    setNewRating(0);
  };

  const handleDelete = (userId) => {
    if (window.confirm("Bạn có chắc muốn xóa đánh giá này không?")) {
      setReviews(reviews.filter((r) => r.userId !== userId));
    }
  };

  const handleEdit = (review) => {
    setNewRating(review.ratingScore);
    setNewContent(review.ratingContent);
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
          onChange={(e, value) => setNewRating(value)}
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
          sx={{
            backgroundColor: "#6C63FF",
            "&:hover": { backgroundColor: "#574bff" },
            borderRadius: 2,
            textTransform: "none",
          }}
        >
          {isEditing ? "Cập nhật" : "Gửi đánh giá"}
        </Button>
      </Paper>

      {/* Danh sách đánh giá */}
      {reviews.length > 0 ? (
        reviews.map((r, idx) => {
          const isOwner = r.userId === currentUserId;
          const isAdmin = currentUserRole === "admin";

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
                <Box display="flex" alignItems="center" gap={2}>
                  {/* AVATAR */}
                  <Avatar
                    src={
                      r.avatar ||
                      "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                    }
                    sx={{ width: 50, height: 50 }}
                  />

                  <Box>
                    <Typography fontWeight="bold">
                      Người dùng #{r.userId}
                    </Typography>

                    <Rating
                      value={r.ratingScore}
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
                        onClick={() => handleDelete(r.userId)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}

                  {!isOwner && isAdmin && (
                    <IconButton
                      onClick={() => handleDelete(r.userId)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
              </Box>

              {/* Nội dung */}
              <Typography sx={{ mt: 1.5, lineHeight: 1.6 }}>
                {r.ratingContent}
              </Typography>
            </Paper>
          );
        })
      ) : (
        <Typography color="text.secondary">
          Chưa có đánh giá nào cho khóa học này.
        </Typography>
      )}
    </Box>
  );
}
