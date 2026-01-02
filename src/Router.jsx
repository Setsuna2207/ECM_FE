import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Scroll to top component
import ScrollToTop from "./components/ScrollToTop";

// Các trang chính (guest & user)
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

import HomePage from "./pages/user/HomePage";
import SearchPage from "./pages/user/SearchPage";
import ProfilePage from "./pages/user/ProfilePage";
import CoursePage from "./pages/user/CoursePage";
import CourseDetailPage from "./pages/user/CourseDetailPage";
import LessonPage from "./pages/user/LessonPage";
import QuizPage from "./pages/user/QuizPage";
import HistoryPage from "./pages/user/HistoryPage";
import FollowingPage from "./pages/user/FollowingPage";
import TestPage from "./pages/user/TestPage";
import TestDetailPage from "./pages/user/TestDetailPage";
import TestResultPage from "./pages/user/TestResultPage";
import TestRcmPage from "./pages/user/TestRcmPage";


// Khu vực quản trị
import Dashboard from "./pages/admin/layout/Dashboard";
import ManageProfile from "./pages/admin/profile";
import ManageReviews from "./pages/admin/reviews";
import ManageLessons from "./pages/admin/lessons";
import ManageCourses from "./pages/admin/courses";
import ManageCategory from "./pages/admin/categories";
import ManageQuizz from "./pages/admin/quizzes";
import ManageUser from "./pages/admin/users";
import ManageTests from "./pages/admin/tests";
import FileConverter from "./pages/admin/converter";
import ManageAIRcm from "./pages/admin/ai-rcm";

export default function AppRouter() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Trang khách & người dùng */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/courses/:category" element={<CoursePage />} />
        <Route path="/course/:courseId" element={<CourseDetailPage />} />
        <Route path="/course/:courseId/lesson/:lessonId" element={<LessonPage />} />
        <Route path="/course/:courseId/lesson/:lessonId/quiz/:quizId" element={<QuizPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/following" element={<FollowingPage />} />
        <Route path="/tests" element={<TestPage />} />
        <Route path="/test/:testId" element={<TestDetailPage />} />
        <Route path="/results" element={<TestResultPage />} />
        <Route path="/test-rcm" element={<TestRcmPage />} />


        {/* Trang quản trị */}
        <Route path="/admin" element={<Dashboard />}>
          <Route index element={<ManageProfile />} />
          <Route path="reviews" element={<ManageReviews />} />
          <Route path="lessons" element={<ManageLessons />} />
          <Route path="courses" element={<ManageCourses />} />
          <Route path="categories" element={<ManageCategory />} />
          <Route path="quizzes" element={<ManageQuizz />} />
          <Route path="users" element={<ManageUser />} />
          <Route path="tests" element={<ManageTests />} />
          <Route path="converter" element={<FileConverter />} />
          <Route path="ai-rcm" element={<ManageAIRcm />} />
        </Route>
      </Routes>
    </Router>
  );
}
