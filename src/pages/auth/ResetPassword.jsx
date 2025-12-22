import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, TextField, Button, Typography, IconButton, InputAdornment, Paper, CircularProgress } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import InfoDialog from "../../components/InfoDialog";
import { ResetPassword as ResetPasswordService } from '../../services/userService';


const ResetPasswordForm = () => {
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [infoDialogOpen, setInfoDialogOpen] = React.useState(false);
	const [info, setInfo] = React.useState('');
	const [loading, setLoading] = useState(false);
	const location = useLocation();
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		const queryParams = new URLSearchParams(location.search);
		const email = queryParams.get('email');
		let token = queryParams.get('token');

		if (password !== confirmPassword) {
			setInfo('Mật khẩu không khớp');
			setInfoDialogOpen(true);
			return;
		}

		if (!password || !email || !token) {
			setInfo('Thông tin không hợp lệ');
			setInfoDialogOpen(true);
			return;
		}

		if (token) {
			token = token.replace(/ /g, '+'); // Fix the + being converted to space
		}

		setLoading(true);

		try {
			const data = {
				email: email,
				token: token,
				newPassword: password
			};

			const res = await ResetPasswordService(data);
			if (res.status === 200) {
				setInfo('Đặt lại mật khẩu thành công');
			} else {
				setInfo('Đã xảy ra lỗi. Vui lòng thử lại sau.');
			}
		} catch (error) {
			console.error('Reset password error:', error);
			setInfo(error.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại sau.');
		} finally {
			setLoading(false);
			setInfoDialogOpen(true);
		}
	};

	const handleInfoDialogClose = () => {
		setInfoDialogOpen(false);
		navigate('/login');
	};

	return (
		<Container component="main" maxWidth="xs" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
			<Paper elevation={3} sx={{ padding: 4, borderRadius: 2, width: '100%', textAlign: 'center' }}>
				<Typography variant="h5" gutterBottom>Đặt lại mật khẩu</Typography>
				<form onSubmit={handleSubmit}>
					<TextField
						fullWidth
						variant="outlined"
						margin="normal"
						label="Mật khẩu mới"
						type={showPassword ? 'text' : 'password'}
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						InputProps={{
							endAdornment: (
								<InputAdornment position="end">
									<IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
										{showPassword ? <VisibilityOff /> : <Visibility />}
									</IconButton>
								</InputAdornment>
							),
						}}
					/>
					<TextField
						fullWidth
						variant="outlined"
						margin="normal"
						label="Xác nhận lại mật khẩu mới"
						type={showConfirmPassword ? 'text' : 'password'}
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						required
						InputProps={{
							endAdornment: (
								<InputAdornment position="end">
									<IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
										{showConfirmPassword ? <VisibilityOff /> : <Visibility />}
									</IconButton>
								</InputAdornment>
							),
						}}
					/>
					<Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }} disabled={loading}>
						{loading ? <CircularProgress size={24} /> : "Đặt lại mật khẩu"}
					</Button>
				</form>
			</Paper>
			<InfoDialog
				open={infoDialogOpen}
				question={info}
				onClose={handleInfoDialogClose}
			/>
		</Container>
	);
};

export default ResetPasswordForm;