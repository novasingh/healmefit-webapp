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
export const fetchHeartDetail = async (token, userId, start) => getFitbitData(`${userId}/activities/heart/date/${start}/1d.json`, token); // check 
export const fetchSleepData = async (token, userId, start) => getFitbitData(`${userId}/sleep/date/${start}.json`, token); // date 
export const fetchStepData = async (token, userId, start) => getFitbitData(`${userId}/activities/date/${start}.json`, token); // daily - weekly