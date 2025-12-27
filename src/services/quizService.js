import api from './axios/axios.customize';

const GetAllQuizzes = () => {
    const URL_API = "/Quiz";
    return api.get(URL_API);
};

const GetQuizById = (quizId) => {
    const URL_API = `/Quiz/${quizId}`;
    return api.get(URL_API);
};

const CreateQuiz = (data) => {
    const URL_API = "/Quiz";
    return api.post(URL_API, data);
};

const UpdateQuiz = (quizId, data) => {
    const URL_API = `/Quiz/${quizId}`;
    return api.put(URL_API, data);
};

const DeleteQuiz = (quizId) => {
    const URL_API = `/Quiz/${quizId}`;
    return api.delete(URL_API);
};

/**
 * Upload quiz file (.json or .js) to create or update a quiz
 * @param {File} file - The quiz file
 * @param {number} lessonId - Lesson ID
 * @param {string} description - Quiz description (optional)
 * @param {number} quizId - Quiz ID for update (optional)
 * @returns {Promise} - API response
 */
const UploadQuizFile = (file, lessonId, description = "", quizId = null) => {
    const formData = new FormData();
    formData.append('file', file);

    const params = new URLSearchParams();
    params.append('lessonId', lessonId);
    if (description) params.append('description', description);
    if (quizId) params.append('quizId', quizId);

    const URL_API = `/Quiz/upload?${params.toString()}`;
    return api.post(URL_API, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000, // 1 minute
    });
};

/**
 * Upload media file (audio/video) for a quiz
 * @param {number} quizId - Quiz ID
 * @param {File} file - The media file
 * @returns {Promise} - API response with media URL
 */
const UploadQuizMedia = (quizId, file) => {
    const formData = new FormData();
    formData.append('file', file);

    const URL_API = `/Quiz/upload-media?quizId=${quizId}`;
    return api.post(URL_API, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 300000, // 5 minutes for large media files
    });
};

export {
    GetAllQuizzes,
    GetQuizById,
    CreateQuiz,
    UpdateQuiz,
    DeleteQuiz,
    UploadQuizFile,
    UploadQuizMedia,
};
