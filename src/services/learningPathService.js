import api from './axios/axios.customize';

export const GetActiveLearningPath = () => api.get("/LearningPath/active");

export const GetLearningPathById = (learningPathId) => api.get(`/LearningPath/${learningPathId}`);
