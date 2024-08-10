import axiosInstance from './axiosInterceptor';

const get = async (url, params = {}) => {
  try {
    const response = await axiosInstance.get(url, { params });
    return response
  } catch (error) {
    return error.response.data
  }
};

const post = async (url, data) => {
  try {
    const response = await axiosInstance.post(url, data);
    return response
  } catch (error) {
    return error.response.data
  }
};

const update = async (url, data) => {
  try {
    const response = await axiosInstance.put(url, data);
    return response
  } catch (error) {
    return error.response.data
  }
};
const updatePatch = async (url, data) => {
  try {
    const response = await axiosInstance.patch(url, data);
    return response
  } catch (error) {
    return error.response.data
  }
};
const remove = async url => {
  try {
    const response = await axiosInstance.delete(url);
    return response
  } catch (error) {
    return error.response.data
  }
};

export { get, post, update, remove, updatePatch };