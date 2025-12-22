import api from './axios/axios.customize';

const GetAllUserGoals = () => {
    const URL_API = "/api/UserGoal";
    return api.get(URL_API);
};

const GetUserGoalById = (goalId) => {
    const URL_API = `/api/UserGoal/${goalId}`;
    return api.get(URL_API);
};

const CreateUserGoal = (data) => {
    const URL_API = "/api/UserGoal";
    return api.post(URL_API, data);
};

const UpdateUserGoal = (goalId, data) => {
    const URL_API = `/api/UserGoal/${goalId}`;
    return api.put(URL_API, data);
};

const DeleteUserGoal = (goalId) => {
    const URL_API = `/api/UserGoal/${goalId}`;
    return api.delete(URL_API);
};

export {
    GetAllUserGoals,
    GetUserGoalById,
    CreateUserGoal,
    UpdateUserGoal,
    DeleteUserGoal,
};
