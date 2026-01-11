import React from "react";
import { Box, Container, Typography, Link, useTheme } from "@mui/material";
import { tokens } from "../theme";

const Footer = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    return (
        <Box
            component="footer"
            sx={{
                backgroundColor: "#1A1D2E",
                color: "#EAEAEA",
                py: 4,
                px: 2,
                mt: 4,
            }}
        >
            <Container maxWidth="lg">
                <Box
                    sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "space-between",
                        gap: 15,
                    }}
                >
                    {/* Mục "Về trang web" */}
                    <Box
                        sx={{
                            flex: 1,
                            minWidth: "250px",
                            mb: 2,
                            "&:not(:last-child)": { mr: 2 },
                        }}
                    >
                        <Typography variant="h6" sx={{ mb: 1 }} style={{ fontWeight: 'bold' }}>
                            Về trang web
                        </Typography>
                        <Typography variant="body2" align="justify">
                            Trang web của chúng tôi là một thư viện chuyên cung cấp khóa học và bài giảng chất lượng, giúp
                            bạn dễ dàng tìm kiếm, học tập và rèn luyện để trau dồi bản thân. Chúng tôi cam kết
                            đem lại trải nghiệm học tập tiện lợi và an toàn.
                        </Typography>
                    </Box>

                    {/* Mục "Thông tin liên hệ" */}
                    <Box
                        sx={{
                            flex: 1,
                            minWidth: "250px",
                            mb: 2,
                            "&:not(:last-child)": { mr: 2 },
                        }}
                    >
                        <Typography variant="h6" sx={{ mb: 1 }} style={{ fontWeight: 'bold' }}>
                            Thông tin liên hệ
                        </Typography>
                        <Typography variant="body2">
                            Địa chỉ: Số 123, Đường ABC, Thành phố XYZ <br />
                            Email:{" "}
                            <Link href="mailto:trantuyen.cfw@gmail.com" color="inherit" underline="hover">
                                trantuyen.cfw@gmail.com
                            </Link>{" "}
                            <br />
                            Điện thoại:{" "}
                            <Link href="tel:+84 972 244 682" color="inherit" underline="hover">
                                0972 244 682
                            </Link>
                        </Typography>
                    </Box>

                    {/* Mục "Chính sách" */}
                    <Box
                        sx={{
                            flex: 1,
                            minWidth: "250px",
                            mb: 2,
                        }}
                    >
                        <Typography variant="h6" sx={{ mb: 1 }} style={{ fontWeight: 'bold' }}>
                            Chính sách
                        </Typography>
                        <Typography variant="body2">
                            <Link href="#" color="inherit" underline="hover">
                                Chính sách bảo mật
                            </Link>
                            <br />
                            <Link href="#" color="inherit" underline="hover">
                                Chính sách người dùng
                            </Link>
                            <br />
                            <Link href="#" color="inherit" underline="hover">
                                Điều khoản sử dụng
                            </Link>
                        </Typography>
                    </Box>
                </Box>
                <Typography variant="body2" align="center" sx={{ mt: 3 }}>
                    © {new Date().getFullYear()} Bản quyền.
                </Typography>
                <Typography variant="body2" align="center" sx={{ mt: 3 }} style={{ align: 'justify', fontStyle: 'italic', fontWeight: 'bold' }}>
                    Hệ thống được phát triển cho mục đích học tập cá nhân.
                    Mọi nội dung và tài liệu trên trang web không nhằm mục đích thương mại và không liên quan đến bất kỳ tổ chức hay cá nhân nào khác.
                    Mọi quyền sở hữu trí tuệ thuộc về các tác giả tương ứng. Nếu có bất kỳ vi phạm nào, vui lòng liên hệ để kịp thời xử lý.
                </Typography>
            </Container>
        </Box>
    );
};

export default Footer;
