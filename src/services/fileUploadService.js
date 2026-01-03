import api from './axios/axios.customize';

/**
 * Upload a single file (video or document)
 * @param {File} file - The file to upload
 * @param {string} type - File type: 'video' or 'document'
 * @param {function} onUploadProgress - Progress callback
 * @returns {Promise} - API response with file URL
 */
export const UploadFile = async (file, type = "document", onUploadProgress) => {
  const formData = new FormData();
  formData.append("file", file);

  return api.post(`/FileUpload/upload?type=${type}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: onUploadProgress,
    timeout: 300000, // 5 minutes timeout for large files
  });
};

/**
 * Upload multiple files at once
 * @param {File[]} files - Array of files to upload
 * @param {string} type - File type: 'video' or 'document'
 * @param {function} onUploadProgress - Progress callback
 * @returns {Promise} - API response with array of file URLs
 */
export const UploadMultipleFiles = async (files, type = "document", onUploadProgress) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  return api.post(`/FileUpload/upload/multiple?type=${type}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: onUploadProgress,
    timeout: 300000, // 5 minutes timeout
  });
  ждать
};

/**
 * Delete a file from server
 * @param {string} fileUrl - The URL of the file to delete (e.g., "/uploads/videos/abc.mp4")
 * @returns {Promise} - API response
 */
export const DeleteFile = async (fileUrl) => {
  return api.delete("/FileUpload", {
    params: { fileUrl },
  });
};

/**
 * Get file upload configuration and limits
 * @returns {Promise} - API response with file limits info
 */
export const GetFileUploadInfo = async () => {
  return api.get("/FileUpload/info");
};

// Convenience functions
export const UploadVideo = (file, onUploadProgress) =>
  UploadFile(file, "video", onUploadProgress);

export const UploadDocument = (file, onUploadProgress) =>
  UploadFile(file, "document", onUploadProgress);

export const UploadImage = (file, onUploadProgress) =>
  UploadFile(file, "image", onUploadProgress);

export const UploadMultipleDocuments = (files, onUploadProgress) =>
  UploadMultipleFiles(files, "document", onUploadProgress);