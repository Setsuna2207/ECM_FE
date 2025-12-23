import api from './axios/axios.customize';

const GetAllPlacementTests = () => {
    const URL_API = "/PlacementTest";
    return api.get(URL_API);
};

const GetPlacementTestById = (testId) => {
    const URL_API = `/PlacementTest/${testId}`;
    return api.get(URL_API);
};

const CreatePlacementTest = (data) => {
    const URL_API = "/PlacementTest";
    return api.post(URL_API, data);
};

const UpdatePlacementTest = (testId, data) => {
    const URL_API = `/PlacementTest/${testId}`;
    return api.put(URL_API, data);
};

const DeletePlacementTest = (testId) => {
    const URL_API = `/PlacementTest/${testId}`;
    return api.delete(URL_API);
};

export {
    GetAllPlacementTests,
    GetPlacementTestById,
    CreatePlacementTest,
    UpdatePlacementTest,
    DeletePlacementTest,
};