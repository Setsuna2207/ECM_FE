import api from './axios/axios.customize'

const GetAllCategory = () => {
    const URL_API = "/api/Category";
    return api.get(URL_API);
};

const CreateCategory = (data) => {
    const URL_API = "/api/Category";
    return api.post(URL_API, data);
};
const UpdateCategory = (CategoryId, data) => {
    const URL_API = `/api/Category/${CategoryId}`;
    return api.put(URL_API, data);
};
const DeleteCategory = (CategoryId) => {
    const URL_API = `/api/Category/${CategoryId}`;
    return api.delete(URL_API);
};

export {
    GetAllCategory,
    CreateCategory,
    UpdateCategory,
    DeleteCategory,
};