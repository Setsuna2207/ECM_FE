import api from './axios/axios.customize';

const GetAllAIFeedbacks = () => {
    const URL_API = "/AIFeedback";
    return api.get(URL_API);
};

const GetAIFeedbackById = (feedbackId) => {
    const URL_API = `/AIFeedback/${feedbackId}`;
    return api.get(URL_API);
};

const CreateAIFeedback = (data) => {
    const URL_API = "/AIFeedback";
    return api.post(URL_API, data);
};

const UpdateAIFeedback = (feedbackId, data) => {
    const URL_API = `/AIFeedback/${feedbackId}`;
    return api.put(URL_API, data);
};

const DeleteAIFeedback = (feedbackId) => {
    const URL_API = `/AIFeedback/${feedbackId}`;
    return api.delete(URL_API);
};

export {
    GetAllAIFeedbacks,
    GetAIFeedbackById,
    CreateAIFeedback,
    UpdateAIFeedback,
    DeleteAIFeedback,
};