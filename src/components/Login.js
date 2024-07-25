import React, { useState, useContext } from 'react';
import axios from 'axios';
import { message } from 'antd';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
// import './Login.css'; // Assu/ming you have styles for login page
// let response = {status:200,role:'admin'}

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage(''); // Clear any previous error messages

    try {
      const response = await axios.post('http://44.211.250.6/v1/auth/login', {
        email,
        password,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    console.log(response,"dvkjsnvdlkn")
      if (response.status === 200) {
        const { user, tokens } = response?.data;
        if (user.role === 'manager') {
          // Handle successful login and update authentication state
          message.success("Successfully Logged In")
          login(user.role,tokens.access.token);
          navigate('/home');
        } else if(user.role === 'driver'){
            message.success("Successfully Logged In")
          // Show error message if role is not admin
          login(user.role,tokens.access.token)
          navigate('/home')
        }
      } else {
        message.error('Not Exist')
      }
    } catch (error) {
      console.error('Error during login:', error);
      message.error('Error during login')
    //   setErrorMessage('Error during login');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Log in</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-box">
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label>Email</label>
          </div>
          <div className="input-box">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label>Password</label>
          </div>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <div className="input-box">
            <input type="submit" value="Log in" />
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
