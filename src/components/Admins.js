import React, { useState, useEffect } from 'react';
import Header from './Header';
import { DeleteOutlined } from '@ant-design/icons';
import { Col, Button, Modal, Form, Input, message, Table, Skeleton, Select } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import { get, post, remove, updatePatch } from "../utility/httpService";
import ThreeDotsDropdown from '../sharedComponents/DropDown';

const Admins = () => {
  const [form] = Form.useForm();
  const [updateForm] = Form.useForm();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [AddModal, setAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalResults, setTotalResults] = useState(0);
  const [formLayout, setFormLayout] = useState([]);
  const [formValues, setFormValues] = useState({});
  const [loading, setLoading] = useState(true)
  const [getAllUsers, setGetAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewModal, setViewModal] = useState(false);
  const [isAddMoreDisabled, setIsAddMoreDisabled] = useState(true);
  const [isAddDriverDisabled, setIsAddDriverDisabled] = useState(true)

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      render: (text, record) => <a>{`${record.firstName} ${record.lastName}`}</a>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
    },
    {
      title: 'Phone No.',
      dataIndex: 'phone',
      render: (_, record) => (record?.phone ? record?.phone : '-'),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      render: (_, record) => (
        <ThreeDotsDropdown onDelete={() => handleDeleteUser(record?.id)} onEdit={() => selectedUserData(record)} emailId={record?.email} />
      ),
    },
  ];

  const fetchUsers = async (page = 1, limit = 10) => {
    try {
      const response = await get('/users?role=admin', {
        page, limit 
      });
      const usersWithKeys = response?.data?.results?.map(user => ({ ...user, key: user.id }));
      setGetAllUsers(usersWithKeys);
      setTotalResults(response.data.totalResults);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const handleDeleteUser = async(id) => {
    await remove(`/users/${id}`).then((response) => {
      if(response){
        message.success('Admin Deleted Successfully.')
        fetchUsers()
      }
    })
  }


  useEffect(() => {
    // Set default form layout with one driver row when modal opens
    if (AddModal && formLayout.length === 0) {
      setFormLayout([{ id: uuidv4(), email: '',phone : '', name: '', role: 'driver' }]);
    }
  }, [AddModal, formLayout?.length]);

  const addFormLayout = () => {
    // Update formValues with current form data
    formLayout.forEach((item) => {
      const values = form.getFieldsValue();
      setFormValues(prev => ({
        ...prev,
        [`email_${item.id}`]: values[`email_${item.id}`] || '',
        [`phone_${item.id}`]: values[`phone_${item.id}`] || '',
        [`name_${item.id}`]: values[`name_${item.id}`] || '',
        [`role_${item.id}`]: values[`role_${item.id}`] || 'admin',
      }));
    });

    setFormLayout([
      ...formLayout,
      { id: uuidv4(), email: '', truckN: '', driverN: '', name: '', role: 'admin' }
    ]);
  };

  const handleDeleteFormLayout = (id) => {
    setFormLayout(formLayout.filter((item) => item.id !== id));
  };

  const handleChange = () => {
    const isAnyFieldEmpty = formLayout.some((item) => {
      const email = form.getFieldValue(`email_${item.id}`);
      const name = form.getFieldValue(`name_${item.id}`);
      const phone = form.getFieldValue(`phone_${item.id}`);
      const role = form.getFieldValue(`role_${item.id}`);
      return !email || !name || !phone || !role;
    });

    setIsAddMoreDisabled(isAnyFieldEmpty);
    setIsAddDriverDisabled(formLayout.some((item) => {
      const email = form.getFieldValue(`email_${item.id}`);
      const name = form.getFieldValue(`name_${item.id}`);
      const phone = form.getFieldValue(`phone_${item.id}`);
      const role = form.getFieldValue(`role_${item.id}`);
      return !email || !name || !phone || !role;
    }));
  };

  useEffect(() => {
    formLayout.forEach((item) => {
      form.setFieldsValue({
        [`email_${item.id}`]: formValues[`email_${item.id}`] || '',
        [`phone_${item.id}`]: formValues[`phone_${item.id}`] || '',
        [`name_${item.id}`]: formValues[`name_${item.id}`] || '',
        [`role_${item.id}`]: formValues[`role_${item.id}`] || 'admin',
      });
    });
  }, [formLayout, formValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const addDriverPromises = formLayout.map((item) => {
        const email = values[`email_${item.id}`];
        const phone = values[`phone_${item.id}`];
        const name = values[`name_${item.id}`];
        const role = 'admin';

        return post('/users', { email, phone, name, role });
      });

      const responses = await Promise.all(addDriverPromises);

      const allSuccessful = responses.every(response => response.status === 201);
      if(allSuccessful){
        message.success('Admins added successfully!');
        fetchUsers(currentPage, pageSize);
        setAddModal(false);
        form.resetFields();
        setFormLayout([]);
        setFormValues({});
      }else {
        message.error('One or more requests failed.');
      }
    } catch (error) {
      if (error.response && error.response.data) {
        message.error(`Error: ${error.response.data.message}`);
      } else {
        message.error('An error occurred while adding admin. Please try again.');
      }
    }
  };
  
  useEffect(() => {
    setLoading(true);
    fetchUsers(currentPage, pageSize);
  }, [currentPage, pageSize]);
  
  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const selectedUserData = (data) => {
    updateForm.setFieldsValue({
      id: data?.id,
      email: data?.email,
      phone: data?.truckN,
      name: `${data?.firstName} ${data?.lastName}`,
    });
    setSelectedUser(data);
    setEditModalVisible(true);
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    setSelectedUser(null);
    updateForm.resetFields()
  };


  const handleUpdate = async () => {
    try {
      const values = await updateForm.validateFields();
      const response = await updatePatch(`/users/${selectedUser.id}`, {
        email: values.email,
        phone: values.phone,
        firstName: values.name.split(' ').length > 0 ? values.name.split(' ')[0] : 'User',
        lastName: values.name.split(' ') ? values.name.split(' ')[1] : 'user',
      });
      if (response.status === 200) {
        message.success("Admin updated successfully!");
        closeEditModal();
        updateForm.resetFields()
        fetchUsers();
      } else {
        message.error("An error occurred while updating the admin.");
      }
    } catch (error) {
      message.error(
        `Error: ${
          error.response?.data?.message ||
          "An error occurred while updating the admin. Please try again."
        }`
      );
    }
  };
  
  
  return (
    <div style={{ height: "100%" }}>
      <Header />
      <Col lg={24} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: '2%' }}>
        <h2 style={{ fontSize: "25px", color: "#0B5676", letterSpacing: "1px", fontWeight: "600",  marginBottom: '10px' }}>Admins</h2>
        <div style={{ display: "flex", gap: "6px" }}>
          {!(getAllUsers.length === 0) && <Button onClick={() => setAddModal(true)} style={{ background: "#1FA6E0", width: "100%", height: "40px", color: "#fff" }}>+ Add Admins</Button>}
        </div>
      </Col>
      {
      !loading ?
      !(getAllUsers.length > 0) ? 
      <Col lg={24} style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80%" }}>
        <Col lg={10} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ textAlign: "center", color: "#BBBBBB", fontWeight: "600" }}>Looks like you have no admin yet.</div>
          <div style={{ textAlign: "center", color: "#BBBBBB", fontWeight: "400" }}>Add a admin and we will send them an invite to join your team.</div>
          <Button onClick={() => setAddModal(true)} style={{ background: "#1FA6E0", width: "100%", height: "40px", color: "#fff" }}> + Add</Button>
        </Col>
      </Col>
      :
      // <div className='TableStyle'>
      <Table
      columns={columns}
      dataSource={getAllUsers}
      pagination={{
        current: currentPage,
        pageSize: pageSize,
        total: totalResults,
        onChange: (page, pageSize) => {
          setCurrentPage(page);
          setPageSize(pageSize)
        },
      }}
      onChange={handleTableChange}
      className="fixed-pagination"
    />
    
    
 : <Skeleton active/>
      }
      <Modal
        title='Add Admin'
        open={AddModal}
        width={900}
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
            onFinish={handleSubmit}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {formLayout.map((item) => (
                <div key={item.id} style={{ display: "flex", gap: "10px", alignItems: "end" }}>
                  <Form.Item
                    name={`email_${item.id}`}
                    label={<div style={{ color: "#BBBBBB" }}>Email</div>}
                    rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}
                    style={{ flex: 1 }}
                  >
                    <Input  placeholder="Enter Email" />
                  </Form.Item>
                  <Form.Item
                    name={`name_${item.id}`}
                    label={<div style={{ color: "#BBBBBB" }}>Name</div>}
                    rules={[{ required: true, message: 'Please enter name' }]}
                    style={{ flex: 1 }}
                  >
                    <Input  placeholder="Enter Name" />
                  </Form.Item>
                  <Form.Item
                    name={`phone_${item.id}`}
                    label={<div style={{ color: "#BBBBBB" }}>Phone</div>}
                    rules={[{ required: true, message: 'Please enter phone number' }]}
                    style={{ flex: 1 }}
                  >
                    <Input  placeholder="Enter phone number" />
                  </Form.Item>
                  <div style={{ fontSize: '24px', cursor: "pointer", marginBottom: '25px' }} onClick={() => handleDeleteFormLayout(item.id)}>
                    <DeleteOutlined />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: 'center' }}>
              <Button
                onClick={addFormLayout}
                style={{ marginBottom: "10px", width: "265px", height: "40px" }}
                disabled={isAddMoreDisabled}
              >
                Add More
              </Button>
              <Button
                onClick={handleSubmit}
                style={{ background: "#1FA6E0", width: "265px", height: "40px", color: "#fff" }}
                disabled={isAddDriverDisabled}
              >
                Add Admin
              </Button>
            </div>
          </Form>
        </div>
      </Modal>
      <Modal
        title='User Details'
        open={viewModal}
        onCancel={() => setViewModal(false)}
        footer={null}
      >
        {selectedUser && (
          <div>
            <p><strong>Name:</strong> {selectedUser.firstName} {selectedUser.lastName}</p>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Role:</strong> {selectedUser.role}</p>
          </div>
        )}
      </Modal>

      <Modal
        title="Edit Admin"
        open={editModalVisible}
        onCancel={closeEditModal}
        onOk={handleUpdate}
        okText="Update Admin"
        cancelText="Cancel"
        centered
      >
        <Form form={updateForm} layout="vertical">
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please input the name!" }]}
          >
            <Input placeholder="Enter name" />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              {
                required: true,
                type: "email",
                message: "Please input a valid email!",
              },
            ]}
          >
            <Input placeholder="Enter email" disabled={true} />
          </Form.Item>
          <Form.Item
            label="Phone Number"
            name="phone"
            rules={[
              {
                required: true,
                message: "Please input the phone number!",
              },
            ]}
          >
            <Input placeholder="Enter phone number" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Admins;
