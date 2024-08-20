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

export const fetchProfileData = async (token) => getFitbitData('profile.json', token);
export const fetchDeviceData = async (token) => getFitbitData('devices.json', token);
export const fetchHeartDetail = async (token) => getFitbitData('activities/heart/date/today/1d.json', token);
export const fetchSleepData = async (token) => getFitbitData('sleep/date/2024-08-09.json', token);
export const fetchStepData = async (token) => getFitbitData('activities/goals/daily.json', token);