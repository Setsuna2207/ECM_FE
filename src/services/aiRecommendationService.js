import api from './axios/axios.customize';

export const AnalyzeGoalAndRecommendTest = () => api.post("/AIRecommendation/analyze-goal");

export const RecommendCoursesBasedOnResult = (learningPathID, resultID) =>
    api.post("/AIRecommendation/recommend-courses", { learningPathID, resultID });

export const GenerateFinalAssessment = (learningPathId) =>
    api.post(`/AIRecommendation/generate-final-test/${learningPathId}`);

export const UpdateCourseCompletion = (learningPathID, courseID) =>
    api.post("/AIRecommendation/update-course-completion", { learningPathID, courseID });
