import { useState, useEffect } from 'react';
import React from 'react';
import { Link } from 'react-router-dom';

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
        <li style={{color:"#BBBBBB33",fontWeight:"600",letterSpacing:"1px",fontSize:"20px",display:"flex",alignItems:"center",justifyContent:"center",border:"0.4px solid #d9d9d9",width:"100%", height:"70px",background:"#f2f2f2", borderRadius:"8px"}}>
        LOGO
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
         : null }
        
        {/* <li><Link to="/documents">Documents</Link></li> */}
      </ul>
    </div>
  );
};

export default Sidebar;
