import { useState, useEffect } from 'react';
import React from 'react';
import { Link } from 'react-router-dom';

// Import your logo image here
import logo from '../assets/HMFjpg.jpg'; // Update this path to where your logo image is located

const Sidebar = (props) => {
  const [role, setRole] = useState('');

  useEffect(() => {
    const storedRole = sessionStorage.getItem('role');
    if (storedRole) {
      setRole(storedRole);
    }
  }, []);

  return (
    <div className="sidebar">
      <ul>
        <li
          style={{
            color: "#BBBBBB33",
            fontWeight: "600",
            letterSpacing: "1px",
            fontSize: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "0.4px solid #d9d9d9",
            width: "100%",
            height: "70px",
            background: "#ffffff",
            borderRadius: "8px",
            padding: "10px" // Optional: add some padding for better image alignment
          }}
        >
          <img
            src={logo}
            alt="Logo"
            style={{ height: "100%", width: "auto", objectFit: "contain" }} // Adjust styles as needed
          />
        </li>
        {role === 'manager' ? 
        <>
          <li style={{padding:'10% 30% 20% 30%'}}><Link to="/home">Home</Link></li>
          <li style={{padding:'0 30% 20% 30%'}}><Link to="/driver">Driver</Link></li>
        </>
        : role === 'driver' ? <>
          <li style={{padding:'10% 30% 20% 30%'}}><Link to="/home">Home</Link></li>
          <li style={{padding:'0 30% 20% 30%'}}><Link to="/health">Health</Link></li>
          <li style={{padding:'0 30% 20% 30%'}}><Link to="/documents">Documents</Link></li>
          </>
        : role === 'admin' && (
          <>
            <li style={{padding:'10% 30% 20% 30%'}}><Link to="/home">Home</Link></li>
            <li style={{padding:'0 30% 20% 30%'}}><Link to="/driver">Driver</Link></li>
            <li style={{padding:'0 30% 20% 30%'}}><Link to="/managers">Managers</Link></li>
            <li style={{padding:'0 30% 20% 30%'}}><Link to="/admins">Admins</Link></li>
            <li style={{padding:'0 30% 20% 30%'}}><Link to="/Companies">Companies</Link></li>
          </>
        )}
        {/* <li><Link to="/documents">Documents</Link></li> */}
      </ul>
    </div>
  );
};

export default Sidebar;
