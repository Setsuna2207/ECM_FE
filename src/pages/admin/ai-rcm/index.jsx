import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    useTheme,
    Alert,
    CircularProgress,
    Typography,
    Chip,
    Card,
    CardContent,
    Grid,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CloseIcon from "@mui/icons-material/Close";
import Header from "../../../components/Header";
import { tokens } from "../../../theme";
import { getAllUserGoalsForAdmin, getAIRecommendationsForUser } from "../../../services/adminAIService";
import { GetCourseById } from "../../../services/courseService";

export default function ManageAIRcm() {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [userGoals, setUserGoals] = useState([]);
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [recommendedCourses, setRecommendedCourses] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingRecs, setLoadingRecs] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchUserGoals();
    }, []);

    const fetchUserGoals = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await getAllUserGoalsForAdmin();
            const goals = response.data || [];

            const formatted = Array.isArray(goals) ? goals.map((goal, index) => ({
                id: goal.userGoalID || goal.UserGoalID || index + 1,
                userGoalID: goal.userGoalID || goal.UserGoalID,
                userID: goal.userID || goal.UserID,
                content: goal.content || goal.Content,
            })) : [];

            setUserGoals(formatted);
        } catch (err) {
            console.error("Failed to fetch user goals:", err);
            setError("Không thể tải danh sách mục tiêu người dùng!");
        } finally {
            setLoading(false);
        }
    };

    const handleViewRecommendations = async (row) => {
        setSelectedGoal(row);
        setOpenDialog(true);
        setLoadingRecs(true);
        setRecommendations([]);
        setRecommendedCourses([]);

        try {
            const response = await getAIRecommendationsForUser(row.userID);
            console.log("AI Recommendations response:", response.data);

            let recs = [];
            if (response.data && response.data.recommendations) {
                recs = response.data.recommendations;
            } else if (response.data && Array.isArray(response.data)) {
                recs = response.data;
            }

            console.log("Parsed recommendations:", recs);
            console.log("Number of recommendations:", recs.length);
            setRecommendations(recs);

            // Fetch full course details
            if (recs.length > 0) {
                console.log("Fetching course details for recommendations...");
                const coursePromises = recs.map(async (rec) => {
                    try {
                        // Handle both courseId and CourseId
                        const courseId = rec.courseId || rec.CourseId;
                        console.log(`Fetching course ${courseId}...`);
                        const courseResponse = await GetCourseById(courseId);
                        console.log(`Course ${courseId} fetched:`, courseResponse.data);
                        return {
                            ...courseResponse.data,
                            aiReason: rec.reason || rec.Reason,
                            priority: rec.priority || rec.Priority,
                        };
                    } catch (err) {
                        console.error(`Error fetching course ${rec.courseId || rec.CourseId}:`, err);
                        return null;
                    }
                });

                const courses = await Promise.all(coursePromises);
                console.log("All courses fetched:", courses);
                const validCourses = courses.filter(c => c !== null);
                console.log("Valid courses:", validCourses);
                setRecommendedCourses(validCourses);
            }
        } catch (err) {
            console.error("Error fetching recommendations:", err);
            if (err.response?.status === 404) {
                setError("Người dùng này chưa có mục tiêu học tập hoặc chưa hoàn thành bài kiểm tra đầu vào");
            } else {
                setError(err.response?.data?.message || "Không thể tải gợi ý AI cho người dùng này");
            }
        } finally {
            setLoadingRecs(false);
        }
    };

    const columns = [
        {
            field: "userGoalID",
            headerName: "ID",
            flex: 0.3,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "userID",
            headerName: "User ID",
            flex: 0.8,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "content",
            headerName: "Mục tiêu học tập",
            flex: 2,
            headerAlign: "center",
            align: "left",
        },
        {
            field: "actions",
            headerName: "Chi tiết",
            flex: 0.6,
            headerAlign: "center",
            align: "center",
            sortable: false,
            renderCell: (params) => (
                <IconButton
                    color="primary"
                    onClick={() => handleViewRecommendations(params.row)}
                    title="Xem gợi ý AI"
                >
                    <VisibilityIcon />
                </IconButton>
            ),
        },
    ];

    return (
        <Box flex="1" overflow="auto" p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Header
                    title="Quản lý gợi ý AI"
                    subtitle="Xem mục tiêu học tập và khóa học được AI gợi ý cho người dùng"
                />
                <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<RefreshIcon />}
                    onClick={fetchUserGoals}
                    disabled={loading}
                    sx={{ borderRadius: 2, textTransform: "none" }}
                >
                    Làm mới
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
                    {error}
                </Alert>
            )}

            <Box
                mt="10px"
                height="70vh"
                sx={{
                    "& .MuiDataGrid-columnHeaders": { backgroundColor: colors.gray[900] },
                    "& .MuiDataGrid-virtualScroller": { backgroundColor: colors.primary[400] },
                }}
            >
                <DataGrid
                    rows={userGoals}
                    columns={columns}
                    getRowId={(row) => row.id}
                    slots={{ toolbar: GridToolbar }}
                    loading={loading}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 10 } },
                    }}
                />
            </Box>

            {/* Dialog to view AI recommendations */}
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                fullWidth
                maxWidth="md"
            >
                <DialogTitle>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box display="flex" alignItems="center" gap={1}>
                            <AutoAwesomeIcon sx={{ color: "#8b5cf6" }} />
                            <Typography variant="h6">Gợi ý AI cho người dùng</Typography>
                        </Box>
                        <IconButton onClick={() => setOpenDialog(false)} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent dividers>
                    {selectedGoal && (
                        <Box mb={3}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                User ID
                            </Typography>
                            <Typography variant="body1" fontWeight="bold" mb={2}>
                                {selectedGoal.userID}
                            </Typography>

                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Mục tiêu học tập
                            </Typography>
                            <Typography variant="body1" mb={2}>
                                {selectedGoal.content}
                            </Typography>
                        </Box>
                    )}

                    {loadingRecs ? (
                        <Box display="flex" justifyContent="center" alignItems="center" py={4}>
                            <CircularProgress />
                        </Box>
                    ) : recommendedCourses.length > 0 ? (
                        <Box>
                            <Typography variant="h6" mb={2}>
                                Khóa học được gợi ý
                            </Typography>
                            <Grid container spacing={2}>
                                {recommendedCourses.map((course, index) => (
                                    <Grid item xs={12} key={course.courseId || course.CourseID || index}>
                                        <Card
                                            sx={{
                                                border: "2px solid #3b82f6",
                                                borderRadius: 2,
                                                boxShadow: "0 4px 12px rgba(59, 130, 246, 0.2)",
                                            }}
                                        >
                                            <CardContent>
                                                <Box display="flex" alignItems="flex-start" gap={2}>
                                                    <Box
                                                        component="img"
                                                        src={course.thumbnailUrl || course.ThumbnailUrl || "https://via.placeholder.com/100"}
                                                        alt={course.title || course.Title}
                                                        sx={{
                                                            width: 100,
                                                            height: 100,
                                                            borderRadius: 2,
                                                            objectFit: "cover",
                                                        }}
                                                    />
                                                    <Box flex={1}>
                                                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                                                            <Chip
                                                                label="AI Đề xuất"
                                                                size="small"
                                                                sx={{
                                                                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                                                    color: "white",
                                                                    fontWeight: "bold",
                                                                }}
                                                            />
                                                            {course.priority && (
                                                                <Chip
                                                                    label={`Ưu tiên #${course.priority}`}
                                                                    size="small"
                                                                    color="primary"
                                                                    variant="outlined"
                                                                />
                                                            )}
                                                        </Box>
                                                        <Typography variant="h6" fontWeight="bold" mb={1}>
                                                            {course.title || course.Title}
                                                        </Typography>
                                                        {course.aiReason && (
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    color: "#3b82f6",
                                                                    fontStyle: "italic",
                                                                    mb: 1,
                                                                    p: 1,
                                                                    backgroundColor: "#eff6ff",
                                                                    borderRadius: 1,
                                                                }}
                                                            >
                                                                💡 {course.aiReason}
                                                            </Typography>
                                                        )}
                                                        <Typography variant="body2" color="text.secondary">
                                                            {course.description || course.Description}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    ) : (
                        <Alert severity="info">
                            Người dùng này chưa có gợi ý khóa học từ AI. Họ cần hoàn thành bài kiểm tra đầu vào trước.
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} variant="outlined">
                        Đóng
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
