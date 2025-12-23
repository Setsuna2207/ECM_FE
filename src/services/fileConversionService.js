import api from './axios/axios.customize';

const ConvertDocxToJson = (file, fileType) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileType', fileType);
  
  return api.post('/FileConversion/convert-docx', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

const ConvertPdfToJson = (file, fileType) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileType', fileType);
  
  return api.post('/FileConversion/convert-pdf', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export { ConvertDocxToJson, ConvertPdfToJson };