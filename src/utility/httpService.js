import axiosInstance from './axiosInterceptor';

const handleResponse = response => {
  if (response.status >= 200 && response.status < 300) {
    return response.data;
  }
  throw new Error(response.statusText);
};

const handleError = error => {
  if (error.response) {
    console.error('Error response:', error.response.data);
    console.error('Error status:', error.response.status);
    console.error('Error headers:', error.response.headers);
    throw new Error(error.response.data.message || 'An error occurred while processing your request.');
  } else if (error.request) {
    console.error('Error request:', error.request);
    throw new Error('No response received from the server. Please try again later.');
  } else {
    console.error('Error message:', error.message);
    throw new Error(error.message);
  }
};

const get = async (url, params = {}) => {
  try {
    const response = await axiosInstance.get(url, { params });
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

const post = async (url, data) => {
  try {
    const response = await axiosInstance.post(url, data);
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

const update = async (url, data) => {
  try {
    const response = await axiosInstance.put(url, data);
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

const remove = async url => {
  try {
    const response = await axiosInstance.delete(url);
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

export { get, post, update, remove };