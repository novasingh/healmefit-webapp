import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/HealMeFit-Logo.webp'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUser, faBuilding, faStethoscope, faFile, faUsers } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../contexts/AuthContext';
import FeedbackModal from './FeedbackModal';  // Adjusted path

const Sidebar = (props) => {
  const { role } = useContext(AuthContext);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  const menuItems = {
    manager: [
      { name: 'Home', link: '/home', icon: faHome },
      { name: 'Driver', link: '/driver', icon: faUser },
      { name: 'FeedBack', action: () => setIsFeedbackModalOpen(true), icon: faFile },
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

  const handleModalOk = () => {
    setIsFeedbackModalOpen(false);
  };

  const handleModalCancel = () => {
    setIsFeedbackModalOpen(false);
  };

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
            padding: "10px",
          }}
        >
          <img src={logo} alt="Logo" style={{ height: "100%", width: "auto", objectFit: "contain" }} />
        </li>

        {menuItems[role]?.map((item, index) => (
          <li key={index} style={{ padding: '10% 30% 20% 30%', display: 'flex', alignItems: 'center' }}>
            <a
              href={item.link || '#'} 
              style={{ textDecoration: 'none' }}
              onClick={item.action ? item.action : null}
            >
              <FontAwesomeIcon icon={item.icon} style={{ color: 'white', marginRight: '10px', cursor: 'pointer' }} />
            </a>
            <Link to={item.link || '#'} onClick={item.action ? item.action : null}>{item.name}</Link>
          </li>
        ))}
      </ul>

      {/* Include the FeedbackModal component */}
      <FeedbackModal
        isModalOpen={isFeedbackModalOpen}
        handleOk={handleModalOk}
        handleCancel={handleModalCancel}
      />
    </div>
  );
};

export default Sidebar;
