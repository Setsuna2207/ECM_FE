import axios from "axios";

// Create a separate axios instance specifically for file conversion
// since it uses a different base path than other APIs
const fileConversionApi = axios.create({
  baseURL: 'https://localhost:7264/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
fileConversionApi.interceptors.request.use(function (config) {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log("Request:", config.method.toUpperCase(), config.url, config.data);
  return config;
}, function (error) {
  console.error("Request error:", error);
  return Promise.reject(error);
});

// Add response interceptor for error handling
fileConversionApi.interceptors.response.use(function (response) {
  console.log("Response:", response.status, response.data);
  return response;
}, function (error) {
  console.error("Response error:", error.response?.status, error.response?.data);
  
  if (error.response?.status === 401) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('currentUser');
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  }
  
  return Promise.reject(error);
});

const ConvertDocxToJson = (file, fileType) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileType', fileType);

  console.log("📤 Sending DOCX conversion request");
  console.log("📤 File:", file.name, "Size:", file.size);
  console.log("📤 FileType:", fileType);
  console.log("📤 API base URL:", fileConversionApi.defaults.baseURL);
  console.log("📤 Full URL will be:", fileConversionApi.defaults.baseURL + '/FileConversion/convert-docx');

  return fileConversionApi.post('/FileConversion/convert-docx', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }).then(response => {
    console.log("✅ DOCX conversion response:", response);
    return response;
  }).catch(error => {
    console.error("❌ DOCX conversion error:", error);
    console.error("❌ Error status:", error.response?.status);
    console.error("❌ Error data:", error.response?.data);
    console.error("❌ Error config:", error.config);
    console.error("❌ Full URL attempted:", error.config?.url);
    throw error;
  });
};

const ConvertPdfToJson = (file, fileType) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileType', fileType);

  console.log("📤 Sending PDF conversion request");
  console.log("📤 File:", file.name, "Size:", file.size);
  console.log("📤 FileType:", fileType);
  console.log("📤 API base URL:", fileConversionApi.defaults.baseURL);
  console.log("📤 Full URL will be:", fileConversionApi.defaults.baseURL + '/FileConversion/convert-pdf');

  return fileConversionApi.post('/FileConversion/convert-pdf', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }).then(response => {
    console.log("✅ PDF conversion response:", response);
    return response;
  }).catch(error => {
    console.error("❌ PDF conversion error:", error);
    console.error("❌ Error status:", error.response?.status);
    console.error("❌ Error data:", error.response?.data);
    console.error("❌ Error config:", error.config);
    console.error("❌ Full URL attempted:", error.config?.url);
    throw error;
  });
};

export { ConvertDocxToJson, ConvertPdfToJson };