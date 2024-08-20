import React, { useContext} from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/HMFjpg.jpg'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUser, faBuilding, faStethoscope, faFile, faUsers } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../contexts/AuthContext';


const Sidebar = (props) => {
  const { role} = useContext(AuthContext);

  const menuItems = {
    manager: [
      { name: 'Home', link: '/home', icon: faHome },
      { name: 'Driver', link: '/driver', icon: faUser },
    ],
    driver: [
      { name: 'Home', link: '/home', icon: faHome },
      { name: 'Health', link: '/health', icon: faStethoscope },
      { name: 'Documents', link: '/documents', icon: faFile },
    ],
    admin: [
      { name: 'Home', link: '/home', icon: faHome },
      { name: 'Driver', link: '/driver', icon: faUser },
      { name: 'Managers', link: '/managers', icon: faUsers },
      { name: 'Admins', link: '/admins', icon: faUsers },
      { name: 'Companies', link: '/Companies', icon: faBuilding },
      { name: 'Inquiry', link: '/inquiry', icon: faFile },
    ],
  };

  return (
    <div className="sidebar">
      <ul>
        <li
          style={{
            color: "#BBBBBB33", // Adjust color as needed
            fontWeight: "600",
            letterSpacing: "1px",
            fontSize: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center", // Align content to the left
            border: "0.4px solid #d9d9d9",
            width: "100%",
            height: "70px",
            background: "#ffffff",
            borderRadius: "8px",
            padding: "10px",
          }}
        >
          <img src={logo} alt="Logo" style={{ height: "100%", width: "auto", objectFit: "contain" }} />
        </li>

        {menuItems[role]?.map((item, index) => (
          <li key={index} style={{ padding: '10% 30% 20% 30%', display: 'flex', alignItems: 'center' }}>
            <a href={item.link} style={{ textDecoration: 'none' }}>
              <FontAwesomeIcon icon={item.icon} style={{ color: 'white', marginRight: '10px', cursor: 'pointer' }} />
            </a>
            <Link to={item.link}>{item.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;