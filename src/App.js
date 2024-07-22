// src/App.js

import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import Driver from './components/Driver';
import Login from './components/Login';
import './style.css';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Content />
        </div>
      </Router>
    </AuthProvider>
  );
};

const Content = () => {
  const { isAuthenticated, role } = useContext(AuthContext);

  return (
    <>
      {isAuthenticated && <Sidebar role={role} />}
      <div className="content">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home role={role} />} />
          <Route path="/driver" element={<Driver />} />
        </Routes>
      </div>
    </>
  );
};

export default App;
