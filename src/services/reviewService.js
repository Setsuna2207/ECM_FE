import api from './axios/axios.customize';

const GetAllReiew = () => {
    const URL_API = "/api/Reiew";
    return api.get(URL_API);
};

const GetReiewByCourseId = (CourseId) => {
    const URL_API = `/api/Reiew/product/${CourseId}`;
    return api.get(URL_API);
};

const GetReiewByuserId = (userId) => {
    const URL_API = `/api/Reiew/user/${userId}`;
    return api.get(URL_API);
};

const CreateReiew = (data) => {
    const URL_API = "/api/Reiew";
    return api.post(URL_API, data);
};

const UpdateReiew = (CourseId, data) => {
    const URL_API = `/api/Reiew/${CourseId}`;
    return api.put(URL_API, data);
};

const DeleteReiew = (CourseId) => {
    const URL_API = `/api/Reiew/${CourseId}`;
    return api.delete(URL_API);
};

export {
    GetAllReiew,
    GetReiewByCourseId,
    GetReiewByuserId,
    CreateReiew,
    UpdateReiew,
    DeleteReiew,
};