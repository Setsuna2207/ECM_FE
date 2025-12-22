import api from './axios/axios.customize';

const GetAllFollowings = () => {
    const URL_API = "/api/Following";
    return api.get(URL_API);
};

const ToggleFollowing = (courseId) => {
    const URL_API = `/api/Following/toggle/${courseId}`;
    return api.post(URL_API);
};

const RemoveFollowing = (courseId) => {
    const URL_API = `/api/Following/${courseId}`;
    return api.delete(URL_API);
};

export {
    GetAllFollowings,
    ToggleFollowing,
    RemoveFollowing,
};
