/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from 'react';
import { message } from 'antd';
import { Link } from 'react-router-dom';
import './Login.css'; // Assuming you have styles for login page
import facebookicon from '../assets/facebook-hmf.webp';
import emailicon from '../assets/email-hmf.webp';
import healmefitlogo from '../assets/HealMeFit-Logo.webp';
import checkmarkicon from '../assets/ResetLogin.webp'; // Assuming you have the checkmark icon
import { post } from '../utility/httpService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [success , setSuccess] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
   
   await post(`/auth/forgot-password`, {
      email
    }).then((res) => {
      if(res.status === 204){
        setSuccess(true)
        message.success('Email Sent Successfully.')
      }
    })
   
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
       {success ? <>
       <h2 style={{color: 'green', marginBottom: 10}}>Email Sent Successfully.</h2>
       <h4>Please check your email to reset the new password.</h4>
       </> : 
       <>
        <h4>Forgot Password</h4>
        <form onSubmit={handleSubmit}>
          <div className="input-box">
          <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
            />

          </div>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <div className="input-box">
            <input type="submit" value="Continue"  />
          </div>
        </form>
       </>}
        <div className="login-footer">
          <Link to="/">Log in </Link>
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
