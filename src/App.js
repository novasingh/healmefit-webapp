

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Home from './components/pages/home/Home';
import Driver from './components/pages/driver';
import Login from './components/pages/auth/Login';
import './style.css';
import Managers from './components/pages/manager';
import Admins from './components/pages/admins';
import Companies from './components/pages/companies';
import Health from './components/pages/health';
import Callback from './components/pages/health/Callback';
import Documents from './components/pages/documents'; 
import ResetPassword from './components/pages/auth/ResetPassword'; 
import ForgotPassword from './components/pages/auth/ForgotPassword';
import Inquiry from './components/pages/inquiry';
import BlankLayout from './components/layouts/BlankLayout';
import MasterLayout from './components/layouts/MasterLayout';
import PageNotFound from './components/PageNotFound';
import DriverDetail from './components/pages/driver/DriverDetail';
import FeedbackModal from './components/layouts/FeedbackModal';

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
          <Route path="/driver/:id" element={<MasterLayout children={<DriverDetail />} />} />
          <Route path="/inquiry" element={<MasterLayout children={<Inquiry />} />} />
          <Route path="/feedbackmodal" element={<MasterLayout children={<FeedbackModal />} />} />
          <Route path="/*" element={<PageNotFound />} />
        </Routes>
      </div>
    </>
  );
};

export default App;
