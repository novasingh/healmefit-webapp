import React, { useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { post } from '../utility/httpService';
import { AuthContext } from '../contexts/AuthContext';

const Callback = () => {
  const navigate = useNavigate();
  const { role } = useContext(AuthContext);

  useEffect(() => {
    const fetchTokens = async (code) => {
      try {
        const response = await axios.post('https://api.fitbit.com/oauth2/token', null, {
          params: {
            code,
            grant_type: 'authorization_code',
            client_id: '23PGQL',
            redirect_uri: 'http://localhost:3000/callback',
          },
          headers: {
            Authorization: `Basic ${btoa('23PGQL:4ea0a9b6e679a00b512ee8478e94385d')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          }
        })
        console.log('response', response)

        const { access_token, refresh_token, expiry, type } = response.data;
        localStorage.setItem('fitbitAccessToken', access_token);
        localStorage.setItem('fitbitRefreshToken', refresh_token);
        // post(`/fitbit/${role.id}`,{
        //     "accessToken": access_token,
        //     "refreshToken": refresh_token,
        //     "user": role.id,
        //     "type": type,
        //     "expires": expiry
        // })
        // Call the function to store the tokens in MongoDB
        await storeTokens(access_token, refresh_token);

        navigate('/health');
      } catch (error) {
        console.error('Error fetching tokens:', error);
      }
    };

    const storeTokens = async (accessToken, refreshToken) => {
      try {
        const response = await fetch('http://localhost:5000/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ accessToken, refreshToken }),
        });

        if (!response.ok) {
          throw new Error('Failed to store tokens');
        }

        const result = await response.json();
        console.log(result.message);
      } catch (error) {
        console.error('Error storing tokens:', error);
      }
    };

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      fetchTokens(code);
    }
  }, [navigate]);

  return <div>Loading...</div>;
};

export default Callback;