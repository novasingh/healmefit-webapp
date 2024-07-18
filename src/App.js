import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import Driver from './components/Driver';
import Login from './components/Login';
import './style.css';

const App = () => {
  return (
    <Router>
      <div className="app-container">
      <Sidebar />
        <div className="content">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/home" element={<Home />} />
            {/* <Route path="/login" element={<Login />} /> */}
            <Route path="/driver" element={<Driver />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
