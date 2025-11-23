import api from './axios/axios.customize'

const GetHistories = () => {
    const URL_API = "/api/History";
    return api.get(URL_API);
};
const CreateHistory = (courseId) => {
    const URL_API = `/api/History/${courseId}`;
    return api.post(URL_API);
};
const UpdateHistoryAccess = (data) => {
    const URL_API = `/api/History/${courseId}/access`;
    return api.post(URL_API, data);
};
const UpdateProgress = (courseId) => {
    const URL_API = `/api/History/${courseId}/progress`;
    return api.get(URL_API);
};
const DeleteHistory = (courseId, data) => {
    const URL_API = `/api/History/${courseId}`;
    return api.delete(URL_API, data);
};
const DeleteAllHistories = () => {
    const URL_API = `/api/History`;
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