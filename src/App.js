

import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import Driver from './components/Driver';
import Login from './components/Login';
import './style.css';
import Managers from './components/Managers';
import Admins from './components/Admins';
import Companies from './components/Companies';

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
  const { isAuthenticated, role, accessToken } = useContext(AuthContext);
  return (
    <>
      {isAuthenticated && <Sidebar role={role} />}
      <div className="content">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home class="padding-4rem" role={role} accessToken={accessToken} />} />
          <Route path="/driver" element={<Driver class="padding-4rem" accessToken={accessToken}/>} />
          <Route path="/managers" element={<Managers class="padding-4rem"/>} />
          <Route path="/admins" element={<Admins class="padding-4rem"/>} />
          <Route path="/companies" element={<Companies class="padding-4rem"/>} />
        </Routes>
      </div>
    </>
  );
};

export default App;
