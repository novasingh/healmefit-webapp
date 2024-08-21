import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import the useNavigate hook
import './404page.css';
import notFoundImage from '../assets/Pagenotfound-hmf.webp'; // Replace with your image path

const PageNotFound = () => {
  const navigate = useNavigate(); // Initialize the navigate function

  const handleLoginRedirect = () => {
    navigate('/home'); // Navigate to the login page
  };

  return (
    <div className="hero-section">
      <div className="image-container">
        <img src={notFoundImage} alt="404 Not Found" className="bg-image" />
      </div>
      <div className="text-container">
        <h1>404</h1>
        <p>Page Not Found</p>
        <button className="login-button" onClick={handleLoginRedirect}>Back To Login</button>
      </div>
    </div>
  );
};

export default PageNotFound;
