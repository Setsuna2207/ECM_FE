import api from './axios/axios.customize';

/**
 * Get all user goals
 * @returns {Promise} - API response with all user goals
 */
export const GetAllUserGoals = () => {
    const URL_API = "/UserGoal";
    return api.get(URL_API);
};

/**
 * Get user goal by ID
 * @param {number} goalId - Goal ID
 * @returns {Promise} - API response with goal details
 */
export const GetUserGoalById = (goalId) => {
    const URL_API = `/UserGoal/${goalId}`;
    return api.get(URL_API);
};

/**
 * Create a new user goal
 * @param {Object} data - Goal data {content: string}
 * @returns {Promise} - API response with created goal
 */
export const CreateUserGoal = (data) => {
    const URL_API = "/UserGoal";
    return api.post(URL_API, data);
};

/**
 * Update user goal
 * @param {number} goalId - Goal ID
 * @param {Object} data - Updated goal data {content: string}
 * @returns {Promise} - API response with updated goal
 */
export const UpdateUserGoal = (goalId, data) => {
    const URL_API = `/UserGoal/${goalId}`;
    return api.put(URL_API, data);
};

/**
 * Delete user goal
 * @param {number} goalId - Goal ID
 * @returns {Promise} - API response
 */
export const DeleteUserGoal = (goalId) => {
    const URL_API = `/UserGoal/${goalId}`;
    return api.delete(URL_API);
};
