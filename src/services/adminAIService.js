import axios from "./axios/axios.customize";

// Admin: Get all user goals with user information
// @returns {Promise} - API response with all user goals

export const getAllUserGoalsForAdmin = async () => {
    return axios.get("/UserGoal/admin/all");
};


// Admin: Get AI course recommendations for a specific user
// @param {string} userId - User ID
// @returns {Promise} - API response with course recommendations

export const getAIRecommendationsForUser = async (userId) => {
    return axios.get(`/ai/recommend-course/${userId}`);
};
