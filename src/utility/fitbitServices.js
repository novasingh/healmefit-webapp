import axios from 'axios';
import moment from 'moment';

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
export const fetchHeartDetail = async (token, userId, start, end, t) => getFitbitData(`${userId}/activities/heart/date/${start}/${t === '7d' ? '7d' : t === '30d' ? '30d' : '1d'}.json`, token); // check 1 ,7 , 30
export const fetchSleepData = async (token, userId, start, end , t) => getFitbitData(`${userId}/sleep/date/${t === '7d' || t === '30d' ? `${start}/${end}` : moment(start).subtract(1, 'd').format('YYYY-MM-DD')}.json`, token); // date 
export const fetchStepData = async (token, userId, start, end, t) => getFitbitData(`${userId}/activities/steps/date/${start}/${t === '7d' ? '7d' : t === '30d' ? '30d' : '1d'}.json`, token); // daily - weekly  1,7,30
export const fetchWeightData = async (token, userId, start, end, t) => getFitbitData(`${userId}/body/log/weight/date/${t === '7d' || t === '30d' ? `${start}/${end}` : moment(start).subtract(1, 'd').format('YYYY-MM-DD')}.json`, token); // daily - weekly  1,7,30