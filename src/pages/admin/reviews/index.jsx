import { useState, useEffect } from "react";
import { Box, IconButton, useTheme, TextField, Autocomplete, CircularProgress, Alert } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import { tokens } from "../../../theme";
import Header from "../../../components/Header";
import { GetAllReview, DeleteReview } from "../../../services/reviewService";
import { GetAllCourses } from "../../../services/courseService";

// Hàm chuyển đổi định dạng ngày
const convertToCustomMonthDate = (dateString, locale, format) => {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    month: format,
    day: "numeric",
    year: "numeric",
  });
};

const ManageReviews = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [reviews, setReviews] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [filterCourse, setFilterCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lấy dữ liệu từ backend
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [reviewsRes, coursesRes] = await Promise.all([
        GetAllReview(),
        GetAllCourses(),
      ]);

      const reviewsData = reviewsRes.data || [];
      const coursesData = coursesRes.data || [];
      setCourses(coursesData);

      const reviewsWithDetails = reviewsData.map((review) => {
        const courseId = review.courseID || review.courseId;
        const userId = review.userID || review.userId;
        const foundCourse = coursesData.find((c) => (c.courseID || c.courseId) === courseId);

        return {
          ...review,
          id: `${userId}-${courseId}`, // Create unique ID from composite keys
          courseId: courseId,
          userId: userId,
          fullName: review.FullName || review.fullName || review.UserName || review.userName || `User #${userId}`,
          courseTitle: foundCourse ? foundCourse.title : "Không tìm thấy khóa học",
        };
      });

      setReviews(reviewsWithDetails);
    } catch (err) {
      setError("Lỗi khi tải dữ liệu đánh giá");
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  // Xóa review
  const handleDeleteSelected = async (row) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đánh giá này không?")) {
      try {
        await DeleteReview(row.userId, row.courseId);
        setReviews((prev) => prev.filter((r) => r.id !== row.id));
        alert("Xóa đánh giá thành công!");
      } catch (err) {
        console.error("Error deleting review:", err);
        alert("Lỗi khi xóa đánh giá");
      }
    }
  };

  // Lọc reviews theo khóa học
  const filteredReviews = filterCourse
    ? reviews.filter((r) => r.courseId === (filterCourse.courseID || filterCourse.courseId))
    : reviews;

  const columns = [
    { field: "courseTitle", headerName: "Khóa học", flex: 1.2, headerAlign: "center" },
    { field: "fullName", headerName: "Người dùng", flex: 0.8, headerAlign: "center", align: "center" },
    { field: "reviewScore", headerName: "Điểm đánh giá", flex: 0.6, headerAlign: "center", align: "center" },
    {
      field: "reviewContent",
      headerName: "Nội dung",
      flex: 1.8,
      headerAlign: "center",
      renderCell: (params) => (
        <Box sx={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: "createdAt",
      headerName: "Thời gian",
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => convertToCustomMonthDate(params.value, "vi-VN", "long"),
    },
    {
      field: "actions",
      headerName: "Hành động",
      flex: 0.5,
      align: "center",
      headerAlign: "center",
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <IconButton color="error" onClick={() => handleDeleteSelected(params.row)}>
          <DeleteIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <Box display="flex" flexDirection="column" height="100vh" m="10px" overflow="auto">
      {/* Tiêu đề */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Header title="Quản lý đánh giá" subtitle="Danh sách đánh giá khóa học" />
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filter */}
      <Box mb={2} width="300px">
        <Autocomplete
          options={courses}
          getOptionLabel={(option) => option.title}
          value={filterCourse}
          onChange={(_, value) => setFilterCourse(value)}
          renderInput={(params) => <TextField {...params} label="Lọc theo khóa học" />}
          clearOnEscape
        />
      </Box>

      {/* DataGrid */}
      <Box
        mt="5px"
        height="75vh"
        maxWidth="100%"
        sx={{
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-cell": { border: "none" },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.gray[900],
            "--DataGrid-containerBackground": "transparent",
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.gray[900],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
        }}
      >
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={filteredReviews}
            columns={columns}
            selectionModel={selectedRows}
            onRowSelectionModelChange={(ids) => setSelectedRows(ids)}
            slots={{ toolbar: GridToolbar }}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          />
        )}
      </Box>
    </Box>
  );
};

export default ManageReviews;
