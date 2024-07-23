import React, { useState, useEffect } from 'react';
import Header from './Header';
import { DeleteOutlined } from '@ant-design/icons';
import { Col, Button, Modal, Form, Input, message } from 'antd';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const Driver = () => {
  const [form] = Form.useForm();
  const [AddModal, setAddModal] = useState(false);
  const [formLayout, setFormLayout] = useState([]);
  const [formValues, setFormValues] = useState({});
  const [isAddMoreDisabled, setIsAddMoreDisabled] = useState(true);
  const [isAddDriverDisabled, setIsAddDriverDisabled] = useState(true);
  const token = localStorage.getItem('accessToken'); // Retrieve the token from localStorage

  useEffect(() => {
    // Set default form layout with one driver row when modal opens
    if (AddModal && formLayout.length === 0) {
      setFormLayout([{ id: uuidv4(), email: '', password: '', name: '', role: '' }]);
    }
  }, [AddModal]);

  const addFormLayout = () => {
    // Update formValues with current form data
    formLayout.forEach((item) => {
      const values = form.getFieldsValue();
      setFormValues(prev => ({
        ...prev,
        [`email_${item.id}`]: values[`email_${item.id}`] || '',
        [`password_${item.id}`]: values[`password_${item.id}`] || '',
        [`name_${item.id}`]: values[`name_${item.id}`] || '',
        [`role_${item.id}`]: values[`role_${item.id}`] || '',
      }));
    });

    setFormLayout([
      ...formLayout,
      { id: uuidv4(), email: '', password: '', name: '', role: '' }
    ]);
  };

  const handleDeleteFormLayout = (id) => {
    setFormLayout(formLayout.filter((item) => item.id !== id));
  };

  const handleChange = () => {
    const isAnyFieldEmpty = formLayout.some((item) => {
      const email = form.getFieldValue(`email_${item.id}`);
      const password = form.getFieldValue(`password_${item.id}`);
      const name = form.getFieldValue(`name_${item.id}`);
      const role = form.getFieldValue(`role_${item.id}`);
      return !email || !password || !name || !role;
    });

    setIsAddMoreDisabled(isAnyFieldEmpty);
    setIsAddDriverDisabled(formLayout.some((item) => {
      const email = form.getFieldValue(`email_${item.id}`);
      const password = form.getFieldValue(`password_${item.id}`);
      const name = form.getFieldValue(`name_${item.id}`);
      const role = form.getFieldValue(`role_${item.id}`);
      return !email || !password || !name || !role;
    }));
  };

  useEffect(() => {
    formLayout.forEach((item) => {
      form.setFieldsValue({
        [`email_${item.id}`]: formValues[`email_${item.id}`] || '',
        [`password_${item.id}`]: formValues[`password_${item.id}`] || '',
        [`name_${item.id}`]: formValues[`name_${item.id}`] || '',
        [`role_${item.id}`]: formValues[`role_${item.id}`] || '',
      });
    });
  }, [formLayout, formValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const addDriverPromises = formLayout.map((item) => {
        const email = values[`email_${item.id}`];
        const password = values[`password_${item.id}`];
        const name = values[`name_${item.id}`];
        const role = values[`role_${item.id}`];

        return axios.post(
          'http://localhost:3000/v1/users/',
          { email, password, name, role },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
      });

      await Promise.all(addDriverPromises);
      message.success('Drivers added successfully!');
      setAddModal(false);
      form.resetFields();
      setFormLayout([]);
      setFormValues({});
    } catch (error) {
      console.error('Error:', error);
      if (error.response && error.response.data) {
        message.error(`Error: ${error.response.data.message}`);
      } else {
        message.error('An error occurred while adding drivers. Please try again.');
      }
    }
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
        <div style={{ padding: "10px" }}>
          <Form
            form={form}
            layout="vertical"
            onValuesChange={handleChange}
          >
            <div style={{ height: formLayout.length > 3 ? "50vh" : '100%', overflowY: 'auto' }}>
              {formLayout.map((item) => (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end" }} key={item.id}>
                  <Form.Item
                    name={`email_${item.id}`}
                    label={<div style={{ color: "#BBBBBB" }}>Email</div>}
                    rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}
                  >
                    <Input style={{ width: "150px" }} placeholder="Enter Email" />
                  </Form.Item>
                  <Form.Item
                    name={`password_${item.id}`}
                    label={<div style={{ color: "#BBBBBB" }}>Password</div>}
                    rules={[{ required: true, message: 'Please enter a password' }]}
                  >
                    <Input.Password style={{ width: "150px" }} placeholder="Enter Password" />
                  </Form.Item>
                  <Form.Item
                    name={`name_${item.id}`}
                    label={<div style={{ color: "#BBBBBB" }}>Name</div>}
                    rules={[{ required: true, message: 'Please enter name' }]}
                  >
                    <Input style={{ width: "150px" }} placeholder="Enter Name" />
                  </Form.Item>
                  <Form.Item
                    name={`role_${item.id}`}
                    label={<div style={{ color: "#BBBBBB" }}>Role</div>}
                    rules={[{ required: true, message: 'Please enter role' }]}
                  >
                    <Input style={{ width: "150px" }} placeholder="Enter Role" />
                  </Form.Item>
                  <div style={{ width: "40px", height: "50px", cursor: "pointer" }} onClick={() => handleDeleteFormLayout(item.id)}>
                    <DeleteOutlined />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Button
                onClick={addFormLayout}
                style={{ marginBottom: "10px", width: "100%", height: "40px" }}
                disabled={isAddMoreDisabled}
              >
                Add More
              </Button>
              <Button
                onClick={handleSubmit}
                style={{ background: "#1FA6E0", width: "100%", height: "40px", color: "#fff" }}
                disabled={isAddDriverDisabled}
              >
                Add Driver
              </Button>
            </div>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default Driver;
