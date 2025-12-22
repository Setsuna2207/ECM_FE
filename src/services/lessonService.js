import api from './axios/axios.customize';

const GetAllLessons = () => {
    const URL_API = "/api/Lesson";
    return api.get(URL_API);
};

const GetLessonById = (lessonId) => {
    const URL_API = `/api/Lesson/${lessonId}`;
    return api.get(URL_API);
};

const GetLessonByCourseId = (courseId) => {
    const URL_API = `/api/Lesson/Course/${courseId}`;
    return api.get(URL_API);
};

const CreateLesson = (data) => {
    const URL_API = "/api/Lesson";
    return api.post(URL_API, data);
};

const UpdateLesson = (lessonId, data) => {
    const URL_API = `/api/Lesson/${lessonId}`;
    return api.put(URL_API, data);
};

const DeleteLesson = (lessonId) => {
    const URL_API = `/api/Lesson/${lessonId}`;
    return api.delete(URL_API);
};

export {
    GetAllLessons,
    GetLessonById,
    GetLessonByCourseId,
    CreateLesson,
    UpdateLesson,
    DeleteLesson,
};