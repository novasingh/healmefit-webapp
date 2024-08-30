import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/HealMeFit-Logo.webp'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUser, faBuilding, faStethoscope, faFile, faUsers, faCommentDots } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../contexts/AuthContext';
import FeedbackModal from './FeedbackModal';  // Adjusted path

const Sidebar = (props) => {
  const { role , userData } = useContext(AuthContext);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  
  console.log(userData)
 
  const checkShowFeedback = () => {
    if(userData?.role !== 'admin' && !userData?.ratingBefore){
      return true;
    }
    return false;
  } 

  const menuItems = {
    manager: [
      { name: 'Home', link: '/home', icon: faHome, show: true },
      { name: 'Driver', link: '/driver', icon: faUser , show : true },
      { name: 'Feedback', action: () => setIsFeedbackModalOpen(true), icon: faCommentDots, show: checkShowFeedback() },
    ],
    driver: [
      { name: 'Home', link: '/home', icon: faHome, show : true },
      { name: 'Health', link: '/health', icon: faStethoscope, show : true },
      { name: 'Documents', link: '/documents', icon: faFile, show : true },
      { name: 'Feedback', action: () => setIsFeedbackModalOpen(true), icon: faFile, show: checkShowFeedback() },
    ],
    admin: [
      { name: 'Home', link: '/home', icon: faHome, show : true },
      { name: 'Driver', link: '/driver', icon: faUser, show: true },
      { name: 'Managers', link: '/managers', icon: faUsers, show : true },
      { name: 'Admins', link: '/admins', icon: faUsers, show : true },
      { name: 'Companies', link: '/Companies', icon: faBuilding , show: true },
      { name: 'Inquiry', link: '/inquiry', icon: faFile, show : true },
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

        {menuItems[role]?.map((item, index) =>  item.show &&  (
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
