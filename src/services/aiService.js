import axios from "./axios/axios.customize";

// AI gợi ý test dựa trên mục tiêu
// Backend tự động lấy userGoal từ profile
export const recommendTest = async () => {
    return axios.get("/ai/recommend-test");
};

// AI gợi ý courses dựa trên test result
// Backend tự động lấy từ learning path của user
export const recommendCourse = async () => {
    return axios.get("/ai/recommend-course");
};
