import api from './axios/axios.customize';

const GetAllReview = () => {
    const URL_API = "/Review";
    return api.get(URL_API);
};

const GetReviewByCourseId = (courseId) => {
    const URL_API = `/Review/Course/${courseId}`;
    return api.get(URL_API);
};

const GetReviewByUserId = (userId) => {
    const URL_API = `/Review/user/${userId}`;
    return api.get(URL_API);
};

const CreateReview = (data) => {
    const URL_API = "/Review";
    return api.post(URL_API, data);
};

const UpdateReview = (courseId, data) => {
    const URL_API = `/Review/${courseId}`;
    return api.put(URL_API, data);
};

const DeleteReview = (courseId) => {
    const URL_API = `/Review/${courseId}`;
    return api.delete(URL_API);
};

export {
    GetAllReview,
    GetReviewByCourseId,
    GetReviewByUserId,
    CreateReview,
    UpdateReview,
    DeleteReview,
};