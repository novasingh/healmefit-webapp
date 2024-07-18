import React from 'react';
import {SearchOutlined} from '@ant-design/icons';
import { Input, Button, Form, Dropdown, Space } from 'antd';
import Header from './Header';

const Home = () => {
  
  const [form] = Form.useForm();
  return(
  <>
  <Header/>
    <div style={{marginTop:"30px", background:"#C8F6653D", width:"100%", padding:"1%"}} >
      <p style={{color:"#88C43E", margin:"auto"}}>Welcome Tyler! Don’t forget to enter all missing information on your profile.</p>
    </div>
    <div style={{marginTop:"30px",display:"flex", flexWrap:"wrap",alignItems:"center", justifyContent:"space-between"}} className='search_bar'>
      <div style={{display:"flex", alignItems:"center",gap:"20px"}}>
    <div style={{width:"70px", height:"70px", border:"0.4px solid #d9d9d9", background:"#f2f2f2", display:"flex", alignItems:"center", justifyContent:"center", color:"#BBBBBB", borderRadius:"50%", fontSize:"32px"}}>TA</div>
      <div><p style={{margin:"auto", fontWeight:"600", fontSize:"24px"}}>Tyler Adams</p>
      <span style={{fontSize:"10px", color:"#1FA6E0", fontWeight:"600"}}>Edit Photo</span>
      </div>
      </div>
    <div><Button type='primary'>Save Changes</Button></div>  
    </div>
    <div>
      <h4 style={{color:"#0B5676"}}>Personal Info</h4>
      <Form
      form={form}
      initialValues={''}
     layout="vertical"
     style={{justifyContent:"space-between", display:"flex"}}
      >
      <Form.Item 
      label={<div style={{color:"#BBBBBB"}}>Full Name</div>}
      >
      <Input style={{width:"300px"}} placeholder="Enter Name" />
      </Form.Item>
      <Form.Item 
      label={<div style={{color:"#BBBBBB"}}>Email</div>}
      >
      <Input style={{width:"300px"}} placeholder="Enter Email" />
      </Form.Item>
      <Form.Item 
      label={<div style={{color:"#BBBBBB"}}>Phone</div>}
      >
      <Input style={{width:"300px"}} placeholder="Enter PhoneNumber" />
      </Form.Item>
      </Form>
    </div>
  </>
  )
};

export default Home;
