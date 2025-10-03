import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
});

const api = {
  listFiles: async () => {
    const response = await apiClient.get('/files/');
    return response.data;
  },

  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/files/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteFile: async (id) => {
    await apiClient.delete(`/files/${id}/`);
  },

  downloadFile: async (id) => {
    const response = await apiClient.get(`/files/${id}/download/`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default api;