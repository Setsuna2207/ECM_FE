import api from './axios/axios.customize';

const GetAllTestResults = () => {
    const URL_API = "/api/TestResult";
    return api.get(URL_API);
};

const GetTestResultById = (resultId) => {
    const URL_API = `/api/TestResult/${resultId}`;
    return api.get(URL_API);
};

const CreateTestResult = (data) => {
    const URL_API = "/api/TestResult";
    return api.post(URL_API, data);
};

const UpdateTestResult = (resultId, data) => {
    const URL_API = `/api/TestResult/${resultId}`;
    return api.put(URL_API, data);
};

const DeleteTestResult = (resultId) => {
    const URL_API = `/api/TestResult/${resultId}`;
    return api.delete(URL_API);
};

export {
    GetAllTestResults,
    GetTestResultById,
    CreateTestResult,
    UpdateTestResult,
    DeleteTestResult,
};