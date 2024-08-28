import axios from 'axios';

const BASE_URL = process.env.REACT_APP_FITBIT_BASE_URL;

const getFitbitData = async (endpoint, token) => {
  try {
    const response = await axios.get(`${BASE_URL}/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
};

export const fetchProfileData = async (token, userId) => getFitbitData(`${userId}/profile.json`, token);
export const fetchDeviceData = async (token, userId) => getFitbitData(`${userId}/devices.json`, token);
export const fetchHeartDetail = async (token, userId) => getFitbitData(`${userId}/activities/heart/date/2024-08-22/1d.json`, token); // check 
export const fetchSleepData = async (token, userId) => getFitbitData(`${userId}/sleep/date/2024-08-09.json`, token); // date 
export const fetchStepData = async (token, userId) => getFitbitData(`${userId}/activities/date/2024-08-22.json`, token); // daily - weekly