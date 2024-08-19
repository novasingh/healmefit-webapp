

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
import Health from './components/Health';
import Callback from './components/Callback';
import Documents from './components/Documents';
import ResetPassword from './components/ResetPassword'; 
import ForgotPassword from './components/ForgotPassword';
import Inquiry from './components/Inquiry';

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
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/callback" element={<Callback  />} />
          <Route path="/home" element={<Home class="padding-4rem" role={role} accessToken={accessToken} />} />
          <Route path="/driver" element={<Driver class="padding-4rem" accessToken={accessToken}/>} />
          <Route path="/health" element={<Health class="padding-4rem" role={role} accessToken={accessToken}/>} />
          <Route path="/driver/health" element={<Health class="padding-4rem" role={role} accessToken={accessToken}/>} />
          <Route path="/documents" element={<Documents class="padding-4rem" role={role} accessToken={accessToken}/>} />
          <Route path="/managers" element={<Managers class="padding-4rem"/>} />
          <Route path="/admins" element={<Admins class="padding-4rem"/>} />
          <Route path="/companies" element={<Companies class="padding-4rem"/>} />
          <Route path="/inquiry" element={<Inquiry class="padding-4rem"/>} />

        </Routes>
      </div>
    </>
  );
};

export default App;
