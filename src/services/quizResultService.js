import api from './axios/axios.customize';

const GetAllQuizResults = () => {
    const URL_API = "/QuizResult";
    return api.get(URL_API);
};

const GetQuizResultById = (resultId) => {
    const URL_API = `/QuizResult/${resultId}`;
    return api.get(URL_API);
};

const CreateQuizResult = (data) => {
    const URL_API = "/QuizResult";
    return api.post(URL_API, data);
};

const UpdateQuizResult = (resultId, data) => {
    const URL_API = `/QuizResult/${resultId}`;
    return api.put(URL_API, data);
};

const DeleteQuizResult = (resultId) => {
    const URL_API = `/QuizResult/${resultId}`;
    return api.delete(URL_API);
};

export {
    GetAllQuizResults,
    GetQuizResultById,
    CreateQuizResult,
    UpdateQuizResult,
    DeleteQuizResult,
};
