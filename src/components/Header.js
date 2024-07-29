import React from 'react';
import { useContext } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { Input, Dropdown, Space, Menu, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const Header = () => {
  const navigate = useNavigate();
  const { userData , logout } = useContext(AuthContext);


  const items = [
    {
      label: (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "30px",
              height: "30px",
              border: "0.4px solid #d9d9d9",
              background: "#f2f2f2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#BBBBBB",
              borderRadius: "50%",
              fontSize: "14px",
            }}
          >
             {userData?.firstName[0]+" "+userData?.lastName[0]}
          </div>
          <div>
            <p style={{ margin: "auto", fontWeight: "600", fontSize: "14px" }}>
              {userData?.firstName+" "+userData?.lastName}
            </p>
          </div>
        </div>
      ),
      key: '3',
    },
    {
      type: 'divider',
    },
    {
      label: 'Profile',
      key: '0',
    },
    {
      label: (
        <div
          onClick={() => {
            // sessionStorage.clear();
            logout()
            navigate('/');
            message.success('Successfully Logged out')
          }}
        >
          Logout
        </div>
      ),
      key: '1',
    },
  ];

  const menu = (
    <Menu items={items} />
  );

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
      }}
      className='search_bar'
    >
      <div style={{ width: "30%" }}>
        <Input size="large" placeholder="Search" prefix={<SearchOutlined />} />
      </div>
      <Dropdown overlay={menu} trigger={['click']}>
        <a onClick={(e) => e.preventDefault()}>
          <Space>
            <div
              style={{
                cursor: "pointer",
                width: "40px",
                height: "40px",
                border: "0.4px solid #d9d9d9",
                background: "#f2f2f2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#BBBBBB",
                borderRadius: "50%",
              }}
            >
              {userData?.firstName[0]+" "+userData?.lastName[0]}
            </div>
          </Space>
        </a>
      </Dropdown>
    </div>
  );
};

export default Header;
