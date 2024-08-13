import React, { useState, useEffect } from 'react';

const WelcomeMessage = ({ userData }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const messageStatus = localStorage.getItem('welcomeMessageStatus');
    if (messageStatus === 'dismissed') {
      setIsVisible(false);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('welcomeMessageStatus', 'dismissed');
  };

  if (!isVisible) return null;

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#E7F8D6', padding: '10px', borderRadius: '5px' }}>
      <p style={{ color: "#88C43E", margin: "auto" }}>
        Welcome {userData?.firstName}! Don’t forget to enter all missing
        information on your profile.
      </p>
      <button onClick={handleClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', marginLeft: '10px' }}>
        &times;
      </button>
    </div>
  );
}

export default WelcomeMessage;
