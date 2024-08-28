import React, { useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { post } from '../utility/httpService';
import { AuthContext } from '../contexts/AuthContext';
import { Col, Spin } from 'antd';

const Callback = () => {
  const navigate = useNavigate();
  const { userData } = useContext(AuthContext);

  useEffect(() => {
    const fetchTokens = async (code) => {
      try {
        const response = await axios.post('https://api.fitbit.com/oauth2/token', null, {
          params: {
            code,
            grant_type: 'authorization_code',
            client_id: process.env.REACT_APP_FITBIT_CLIENT_ID,
            redirect_uri: process.env.REACT_APP_FITBIT_REDIRECT_URI,
          },
          headers: {
            Authorization: `Basic ${btoa(`${process.env.REACT_APP_FITBIT_CLIENT_ID}:${process.env.REACT_APP_FITBIT_CLIENT_SECRET}`)}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          }
        })
        const { access_token, refresh_token, expires_in, token_type, user_id } = response.data;
        localStorage.setItem('fitbitAccessToken', access_token);
        localStorage.setItem('fitbitRefreshToken', refresh_token);
        post(`/fitbit/${userData.id}`,{
            "accessToken": access_token,
            "refreshToken": refresh_token,
            "user": userData.id,
            "type": token_type,
            "expires": new Date(Date.now() + expires_in * 1000),
            "fitbitUserId" : user_id
        })
        // Call the function to store the tokens in MongoDB
        // await storeTokens(access_token, refresh_token);

        navigate('/health');
      } catch (error) {
        console.error('Error fetching tokens:', error);
      }
    };

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      fetchTokens(code);
    }
  }, [navigate]);

  return (
    <Col style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' ,width: '100%'}}>
    <Spin />
 </Col>
  );
};

export default Callback;