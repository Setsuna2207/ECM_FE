import api from './axios/axios.customize';

const GetHistories = () => {
    const URL_API = "/History";
    return api.get(URL_API);
};

const CreateHistory = (courseId) => {
    const URL_API = `/History/${courseId}`;
    return api.post(URL_API);
};

const UpdateHistoryAccess = (courseId) => {
    const URL_API = `/History/${courseId}/access`;
    return api.put(URL_API);
};

const UpdateProgress = (courseId) => {
    const URL_API = `/History/${courseId}/progress`;
    return api.put(URL_API);
};

const DeleteHistory = (courseId) => {
    const URL_API = `/History/${courseId}`;
    return api.delete(URL_API);
};

const DeleteAllHistories = () => {
    const URL_API = `/History`;
    return api.delete(URL_API);
};

export {
    GetHistories,
    CreateHistory,
    UpdateHistoryAccess,
    UpdateProgress,
    DeleteHistory,
    DeleteAllHistories,
};