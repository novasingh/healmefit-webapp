import React, { useState, useContext } from 'react';
import axios from 'axios';
import { message } from 'antd';
import { AuthContext } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css'; // Assuming you have styles for login page
import facebookicon from '../assets/facebook.png';
import emailicon from '../assets/email.png';
import healmefitlogo from '../assets/HMFjpg.jpg';
import checkmarkicon from '../assets/ResetLogin.png'; // Assuming you have the checkmark icon

const ForgotPassword = () => {
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
      });
      if (response.status === 200) {
        const { user, tokens } = response.data;
        if (user.role === 'manager' || user.role === 'driver' || user.role === 'admin') {
          message.success("Successfully Logged In");
          login(user, tokens.access.token);
          navigate('/home');
        } else {
          message.error('Not Exist');
        }
      } else {
        message.error('Not Exist');
      }
    } catch (error) {
      console.error('Error during login:', error);
      message.error('Error during login');
    }
  };

  return (
    <div className="login-container">
      <div className="login-info">
        <div className="circle">
          <div> <a href="#"><img src={checkmarkicon} alt="Facebook" /></a></div>
        </div>
        <h3>We aim to improve the safety and compliance issues in trucking companies 
            and the well-being of truckers.</h3>
      </div>
      <div className="login-box">
      <div style={{width: '320px', textAlign: 'center'}}> 
        <div className="login-logo">
          <img src={healmefitlogo} alt="Heal Me Fit Logo" />
        </div>
        <h4>Forgot Password</h4>
        <form onSubmit={handleSubmit}>
          <div className="input-box">
          <input
              type="email"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Email Address"
            />

          </div>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <div className="input-box">
            <input type="submit" value="Continue" />
          </div>
        </form>
        <div className="login-footer">
          <Link to="/">Login in </Link>
        </div>
        <footer>
          <p>&copy; 2024 Heal Me Fit</p>
          <p>123 Street, San Jose, CA 12345 USA</p><br></br>
          <div className="social-links">
            <a href="https://www.facebook.com/HealMeFit"><img src={facebookicon} alt="Facebook" /></a>
            <a href="mailto:support@healmefit.com"><img src={emailicon} alt="Email" /></a>
          </div>
        </footer>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
