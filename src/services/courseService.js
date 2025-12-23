import api from './axios/axios.customize';

const GetAllCourses = () => {
    const URL_API = "/Course";
    return api.get(URL_API);
};

const GetCourseById = (courseId) => {
    const URL_API = `/Course/${courseId}`;
    return api.get(URL_API);
};

const GetCoursesByCategory = (categoryId) => {
    const URL_API = `/Course/Category/${categoryId}`;
    return api.get(URL_API);
};

const CreateCourse = (data) => {
    const URL_API = "/Course";
    return api.post(URL_API, data);
};

const UpdateCourse = (courseId, data) => {
    const URL_API = `/Course/${courseId}`;
    return api.put(URL_API, data);
};

const DeleteCourse = (courseId) => {
    const URL_API = `/Course/${courseId}`;
    return api.delete(URL_API);
};

export {
    GetAllCourses,
    GetCourseById,
    GetCoursesByCategory,
    CreateCourse,
    UpdateCourse,
    DeleteCourse,
};