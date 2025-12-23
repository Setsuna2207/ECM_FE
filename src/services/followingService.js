import api from './axios/axios.customize';

const GetAllFollowings = () => {
    const URL_API = "/Following";
    return api.get(URL_API);
};

const ToggleFollowing = (courseId) => {
    const URL_API = `/Following/toggle/${courseId}`;
    return api.post(URL_API);
};

const RemoveFollowing = (courseId) => {
    const URL_API = `/Following/${courseId}`;
    return api.delete(URL_API);
};

export {
    GetAllFollowings,
    ToggleFollowing,
    RemoveFollowing,
};
