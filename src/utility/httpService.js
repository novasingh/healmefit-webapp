import { message } from 'antd';
import axiosInstance from './axiosInterceptor';

const get = async (url, params = {}) => {
  try {
    const response = await axiosInstance.get(url, { params });
    return response
  } catch (error) {
    message.error(error?.response?.data?.message)
    return error
  }
};

const post = async (url, data, config = {}) => {
  try {
    const response = await axiosInstance.post(url, data, config);
    return response
  } catch (error) {
    message.error(error?.response?.data?.message)
    return error
  }
};

const update = async (url, data) => {
  try {
    const response = await axiosInstance.put(url, data);
    return response
  } catch (error) {
    message.error(error?.response?.data?.message)
    return error
  }
};
const updatePatch = async (url, data) => {
  try {
    const response = await axiosInstance.patch(url, data);
    return response
  } catch (error) {
    message.error(error?.response?.data?.message)
    return error
  }
};
const remove = async url => {
  try {
    const response = await axiosInstance.delete(url);
    return response
  } catch (error) {
    message.error(error?.response?.data?.message)
    return error
  }
};

export { get, post, update, remove, updatePatch };