import api from './axios/axios.customize';

const GetAllQuizzes = () => {
    const URL_API = "/api/Quiz";
    return api.get(URL_API);
};

const GetQuizById = (quizId) => {
    const URL_API = `/api/Quiz/${quizId}`;
    return api.get(URL_API);
};

const CreateQuiz = (data) => {
    const URL_API = "/api/Quiz";
    return api.post(URL_API, data);
};

const UpdateQuiz = (quizId, data) => {
    const URL_API = `/api/Quiz/${quizId}`;
    return api.put(URL_API, data);
};

const DeleteQuiz = (quizId) => {
    const URL_API = `/api/Quiz/${quizId}`;
    return api.delete(URL_API);
};

export {
    GetAllQuizzes,
    GetQuizById,
    CreateQuiz,
    UpdateQuiz,
    DeleteQuiz,
};
