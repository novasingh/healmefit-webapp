import React, { useState } from 'react';
import Header from './Header';
import { DeleteOutlined } from '@ant-design/icons';
import { Col, Button, Modal, Form, Input } from 'antd';

const Driver = () => {
  const [form] = Form.useForm();
  const [AddModal, setAddModal] = useState(false);
  const [formLayout, setFormLayout] = useState([]);

  const addFormLayout = () => {
    setFormLayout([
      ...formLayout,
      { id: formLayout.length, first_name: '', last_name: '', email: '' }
    ]);
  };

  const handleDeleteFormLayout = (id) => {
    setFormLayout(formLayout.filter((item) => item.id !== id));
  };

  return (
    <div style={{ height: "100%" }}>
      <Header />
      <Col lg={24} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ fontSize: "25px", color: "#0B5676", letterSpacing: "1px", fontWeight: "600" }}>Drivers</h3>
        <Button onClick={() => setAddModal(true)} style={{ background: "#1FA6E0", width: "10%", height: "40px", color: "#fff" }}>+ Add</Button>
      </Col>
      <Col lg={24} style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80%" }}>
        <Col lg={10} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ textAlign: "center", color: "#BBBBBB", fontWeight: "600" }}>Looks like you have no drivers yet.</div>
          <div style={{ textAlign: "center", color: "#BBBBBB", fontWeight: "400" }}>Add a driver and we will send them an invite to join your team.</div>
          <Button onClick={() => setAddModal(true)} style={{ background: "#1FA6E0", width: "100%", height: "40px", color: "#fff" }}> + Add</Button>
        </Col>
      </Col>
      <Modal
      title='Add Drivers'
        open={AddModal}
        width={700}
        onCancel={() => setAddModal(false)}
        destroyOnClose
        centered
        footer={null}
      >
        <div style={{padding:"10px"}}>
        <Form
          form={form}
          initialValues={''}
          layout="vertical"
        >
            <div style={{height:formLayout.length>3 ? "50vh" : '100%',overflowY:'auto'}}>
          {formLayout.map((item) => (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end" }} key={item.id}>
              <Form.Item
                name={`first_name_${item.id}`}
                label={<div style={{ color: "#BBBBBB" }}>First Name</div>}
              >
                <Input style={{ width: "150px" }} placeholder="Enter First Name" />
              </Form.Item>
              <Form.Item
                name={`last_name_${item.id}`}
                label={<div style={{ color: "#BBBBBB" }}>Last Name</div>}
              >
                <Input style={{ width: "150px" }} placeholder="Enter Last Name" />
              </Form.Item>
              <Form.Item
                name={`email_${item.id}`}
                label={<div style={{ color: "#BBBBBB" }}>Email</div>}
              >
                <Input style={{ width: "150px" }} placeholder="Enter Email" />
              </Form.Item>
              <div style={{ width: "40px", height: "50px", cursor: "pointer" }} onClick={() => handleDeleteFormLayout(item.id)}>
                <DeleteOutlined />
              </div>
            </div>
          ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Button onClick={addFormLayout} style={{ marginBottom: "10px", width: "100%", height: "40px" }}>Add More</Button>
            <Button style={{ background: "#1FA6E0", width: "100%", height: "40px", color: "#fff" }}>Add Driver</Button>
          </div>
        </Form>
        </div>
      </Modal>
    </div>
  );
};

export default Driver;
