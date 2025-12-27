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

/**
 * Upload test file (.json or .js) to create or update a placement test
 * @param {File} file - The test file
 * @param {string} title - Test title
 * @param {string} description - Test description (optional)
 * @param {number} testId - Test ID for update (optional)
 * @returns {Promise} - API response
 */
const UploadTestFile = (file, title, description = "", testId = null) => {
    const formData = new FormData();
    formData.append('file', file);

    const params = new URLSearchParams();
    params.append('title', title);
    if (description) params.append('description', description);
    if (testId) params.append('testId', testId);

    const URL_API = `/PlacementTest/upload?${params.toString()}`;
    return api.post(URL_API, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 1 minute timeout for file processing
    });
};

/**
 * Upload media file (audio/video) for a placement test
 * @param {number} testId - Test ID
 * @param {File} file - The media file
 * @returns {Promise} - API response with media URL
 */
const UploadTestMedia = (testId, file) => {
    const formData = new FormData();
    formData.append('file', file);

    const URL_API = `/PlacementTest/${testId}/upload-media`;
    return api.post(URL_API, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        timeout: 300000, // 5 minutes for large media files
    });
};

export {
    GetAllPlacementTests,
    GetPlacementTestById,
    CreatePlacementTest,
    UpdatePlacementTest,
    DeletePlacementTest,
    UploadTestFile,
    UploadTestMedia,
};