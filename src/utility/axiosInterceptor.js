import axios from 'axios';


const axiosInstance = axios.create({
  baseURL: 'http://44.211.250.6/v1', 
});

axiosInstance.interceptors.request.use(
  config => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export default axiosInstance;