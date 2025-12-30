import api from './axios/axios.customize';

/**
 * Analyze user's learning goal from UserGoal table and get AI-recommended placement test
 * Note: User must have a goal set in UserGoal table first
 * @returns {Promise} - API response with recommended test
 */
export const AnalyzeGoalAndRecommendTest = () => {
    const URL_API = "/AIRecommendation/analyze-goal";
    return api.post(URL_API);
};

/**
 * Get AI-recommended courses based on test result
 * @param {number} learningPathID - Learning path ID
 * @param {number} resultID - Test result ID
 * @returns {Promise} - API response with recommended courses
 */
export const RecommendCoursesBasedOnResult = (learningPathID, resultID) => {
    const URL_API = "/AIRecommendation/recommend-courses";
    return api.post(URL_API, { learningPathID, resultID });
};

/**
 * Generate final assessment test after completing all courses
 * @param {number} learningPathId - Learning path ID
 * @returns {Promise} - API response with final test
 */
export const GenerateFinalAssessment = (learningPathId) => {
    const URL_API = `/AIRecommendation/generate-final-test/${learningPathId}`;
    return api.post(URL_API);
};

/**
 * Update course completion status in learning path
 * @param {number} learningPathID - Learning path ID
 * @param {number} courseID - Course ID that was completed
 * @returns {Promise} - API response
 */
export const UpdateCourseCompletion = (learningPathID, courseID) => {
    const URL_API = "/AIRecommendation/update-course-completion";
    return api.post(URL_API, { learningPathID, courseID });
};

/**
 * Get user's active learning path
 * @param {string} userId - User ID
 * @returns {Promise} - API response with learning path details
 */
export const GetActiveLearningPath = (userId) => {
    const URL_API = `/LearningPath/user/${userId}/active`;
    return api.get(URL_API);
};
