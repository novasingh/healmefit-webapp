import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post('http://localhost:3000/v1/auth/login', {
        email,
        password,
      });

      if (response.status === 200) {
        // Assuming you receive user data and tokens from the response
        const { user, tokens } = response.data;

        // Save user and tokens to local storage or context for authentication
        // For example, you can create an AuthContext to store user information
        // and redirect to Profile page after successful login

        // Redirect to Profile page
        window.location.href = '/home';
      } else {
        alert('Invalid credentials');
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('Error during login');
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
          <div className="input-box">
            <input type="submit" value="Log in" />
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;