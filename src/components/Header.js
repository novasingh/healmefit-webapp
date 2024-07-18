import React from 'react'
import {SearchOutlined} from '@ant-design/icons';
import { Input, Button, Form, Dropdown, Space } from 'antd';

const Header = () => {
    const items = [
        {
          label: <div style={{display:"flex", alignItems:"center",gap:"8px"}}><div style={{width:"30px", height:"30px", border:"0.4px solid #d9d9d9", background:"#f2f2f2", display:"flex", alignItems:"center", justifyContent:"center", color:"#BBBBBB", borderRadius:"50%", fontSize:"14px"}}>TA</div>
          <div><p style={{margin:"auto", fontWeight:"600", fontSize:"14px"}}>Tyler Adams</p>
          {/* <span style={{fontSize:"6px", color:"#1FA6E0", fontWeight:"600"}}>Edit Photo</span> */}
          </div></div>,
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
          label:'Logout',
          key: '1',
        },
      ];

  return (
    <div style={{display:"flex", flexWrap:"wrap",alignItems:"center", justifyContent:"space-between"}} className='search_bar'>
    <div style={{width:"30%"}}><Input size="large" placeholder="Search" prefix={<SearchOutlined /> }/></div>
     <Dropdown style={{width:"30vh"}}
    menu={{
      items,
    }}
    trigger={['click']}
  >
    <a onClick={(e) => e.preventDefault()}>
      <Space>
      <div style={{cursor:"pointer",width:"40px", height:"40px", border:"0.4px solid #d9d9d9", background:"#f2f2f2", display:"flex", alignItems:"center", justifyContent:"center", color:"#BBBBBB", borderRadius:"50%"}}>TA</div>
      </Space>
    </a>
  </Dropdown>

    </div>
  )
}

export default Header