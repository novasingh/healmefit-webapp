import React, { useState, useContext, useEffect } from 'react';
import { message } from 'antd';
import { AuthContext } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import facebookicon from '../assets/facebook.png';
import emailicon from '../assets/email.png';
import healmefitlogo from '../assets/HMFjpg.jpg';
import checkmarkicon from '../assets/Frame 97.png';
import { post } from '../utility/httpService';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
  
    script.onload = () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: 'YOUR_CLIENT_ID_HERE', // Replace with your actual client ID
          callback: handleGoogleResponse,
        });
        window.google.accounts.id.renderButton(
          document.getElementById('googleSignInDiv'),
          { theme: 'outline', size: 'large', width: '100%' }
        );
        console.log('Google Sign-In button initialized');
      }
    };
  
    script.onerror = () => {
      console.error('Failed to load Google Sign-In script');
    };
  
    document.body.appendChild(script);
  
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initializeGoogleSignIn = () => {
    if (window.google && window.google.accounts) {
      window.google.accounts.id.initialize({
        client_id: '502464504225-suhn1s1437jq3neg8g57pat8po7pce3c.apps.googleusercontent.com', // Ensure this is correct
        callback: handleGoogleResponse,
      });
      window.google.accounts.id.renderButton(
        document.getElementById('googleSignInDiv'),
        { theme: 'outline', size: 'large', width: '100%' }
      );
      console.log('Google Sign-In button initialized');
    } else {
      console.log('Google object not available yet');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    try {
      const response = await post('/auth/login', {
        email,
        password,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        const { user, tokens } = response.data;
        if (['manager', 'driver', 'admin'].includes(user.role)) {
          message.success("Successfully Logged In");
          login(user, tokens.access.token);
          navigate('/home');
        } else {
          message.error('User role not authorized');
        }
      } else {
        message.error('Invalid login credentials');
      }
    } catch (error) {
      message.error('Error during login');
    }
  };

  const handleGoogleResponse = async (response) => {
    try {
      console.log('Google response received:', response);
      const backendResponse = await post('https://api.healmefit.io/v1/auth/google-login', {
        credential: response.credential,
      });

      if (backendResponse.status === 200) {
        const { user, tokens } = backendResponse.data;
        if (['manager', 'driver', 'admin'].includes(user.role)) {
          message.success("Successfully Logged In with Google");
          login(user, tokens.access.token);
          navigate('/home');
        } else {
          message.error('User role not authorized');
        }
      } else {
        message.error('Google login failed');
      }
    } catch (error) {
      console.error('Error during Google login:', error);
      message.error('Error during Google login');
    }
  };

  return (
    <div className="login-container">
      <div className="login-info">
        <div className="circle">
          <div><a href="#"><img src={checkmarkicon} alt="Checkmark" /></a></div>
        </div>
        <h3>We aim to improve the safety and compliance issues in trucking companies and the well-being of truckers.</h3>
      </div>
      <div className="login-box">
        <div style={{textAlign: 'center', width: '320px'}}> 
        <div className="login-logo">
          <img src={healmefitlogo} alt="Heal Me Fit Logo" />
        </div>
        <h2>Welcome To Heal Me Fit!</h2>
        <p></p><br />
        <form onSubmit={handleSubmit}>
          <div id="googleSignInDiv"></div>
          <div className="divider">or</div>
          <div className="input-box">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
          </div>
          <div className="input-box">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
          </div>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <div className="input-box">
            <input type="submit" value="Log In" />
          </div>
        </form>
        <div className="login-footer">
          <Link to="/forgot-password">Forgot Password?</Link>
        </div>
        <footer>
          <p>&copy; 2024 Heal Me Fit</p>
          <p>123 Street, San Jose, CA 12345 USA</p><br />
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

export default Login;
