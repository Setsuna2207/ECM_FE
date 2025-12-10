import React, { useState, useEffect } from "react";
import { Box, IconButton, useTheme, TextField, Autocomplete } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import { tokens } from "../../../theme";
import Header from "../../../components/Header";
import { mockReviews } from "../../../data/mockReview";
import { mockCourses } from "../../../data/mockCourse";

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
  const [selectedRows, setSelectedRows] = useState([]);
  const [filterCourse, setFilterCourse] = useState(null);

  // Lấy dữ liệu từ mock
  useEffect(() => {
    const reviewsWithId = mockReviews.map((review, index) => ({
      ...review,
      reviewId: review.reviewId || index + 1,
    }));

    const reviewsWithCourseTitle = reviewsWithId.map((review) => {
      const foundCourse = mockCourses.find((c) => c.courseId === review.courseId);
      return {
        ...review,
        courseTitle: foundCourse ? foundCourse.title : "Không tìm thấy khóa học",
      };
    });

    setReviews(reviewsWithCourseTitle);
  }, []);

  // Xóa review
  const handleDeleteSelected = (row) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đánh giá này không?")) {
      setReviews((prev) => prev.filter((r) => r.reviewId !== row.reviewId));
      alert("Xóa đánh giá thành công!");
    }
  };

  // Lọc reviews theo khóa học
  const filteredReviews = filterCourse
    ? reviews.filter((r) => r.courseId === filterCourse.courseId)
    : reviews;

  const columns = [
    { field: "reviewId", headerName: "ID", flex: 0.3, align: "center", headerAlign: "center" },
    { field: "courseTitle", headerName: "Khóa học", flex: 1.2, headerAlign: "center" },
    { field: "userName", headerName: "Người dùng", flex: 0.8, headerAlign: "center", align: "center" },
    { field: "ratingScore", headerName: "Điểm đánh giá", flex: 0.6, headerAlign: "center", align: "center" },
    {
      field: "ratingContent",
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

      {/* Filter */}
      <Box mb={2} width="300px">
        <Autocomplete
          options={mockCourses}
          getOptionLabel={(option) => option.title}
          value={filterCourse}
          onChange={(e, value) => setFilterCourse(value)}
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
        <DataGrid
          rows={filteredReviews}
          columns={columns}
          getRowId={(row) => row.reviewId}
          selectionModel={selectedRows}
          onRowSelectionModelChange={(ids) => setSelectedRows(ids)}
          slots={{ toolbar: GridToolbar }}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        />
      </Box>
    </Box>
  );
};

export default ManageReviews;
