import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
// import Health from './components/Health';
// import Documents from './components/Documents';
import Driver from './components/Driver';
import './style.css';

const App = () => {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            {/* <Route path="/health" element={<Health />} /> */}
            <Route path="/driver" element={<Driver />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
