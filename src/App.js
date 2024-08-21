

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
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
import BlankLayout from './components/layouts/BlankLayout';
import MasterLayout from './components/layouts/MasterLayout';
import PageNotFound from './components/PageNotFound';
import DriverDetail from './components/DriverDetail';

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
  return (
    <>
      <div className="content">
        <Routes>
          <Route path="/" element={<BlankLayout children={<Login />} />} />
          <Route path="/reset-password" element={<ResetPassword children={<Login />} />} />
          <Route path="/forgot-password" element={<ForgotPassword children={<Login />} />} />
          <Route path="/callback" element={<MasterLayout children={<Callback  />} />} />
          <Route path="/home" element={<MasterLayout children={<Home />} />} />
          <Route path="/driver" element={<MasterLayout children={<Driver />} />} />
          <Route path="/health" element={<MasterLayout children={<Health />} />} />
          <Route path="/driver/driverdetail" element={<MasterLayout children={<DriverDetail />} />} />
          <Route path="/documents" element={<MasterLayout children={<Documents />} />} />
          <Route path="/managers" element={<MasterLayout children={<Managers  />} />} />
          <Route path="/admins" element={<MasterLayout children={<Admins />} />} />
          <Route path="/companies" element={<MasterLayout children={<Companies />} />} />
          <Route path="/driverdetail" element={<DriverDetail children={<DriverDetail />} />} />
          <Route path="/inquiry" element={<MasterLayout children={<Inquiry />} />} />
          <Route path="/*" element={<PageNotFound />} />
        </Routes>
      </div>
    </>
  );
};

export default App;
