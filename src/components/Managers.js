import React, { useState, useEffect } from 'react';
import Header from './Header';
import { DeleteOutlined } from '@ant-design/icons';
import { Col, Button, Modal, Form, Input, message, Table, Skeleton } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import { get, post, remove } from "../utility/httpService";
import ThreeDotsDropdown from '../sharedComponents/DropDown';

const Managers = (props) => {
  const [form] = Form.useForm();
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
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isAddMoreDisabled, setIsAddMoreDisabled] = useState(true);
  const [isAddDriverDisabled, setIsAddDriverDisabled] = useState(true);
  const token = sessionStorage.getItem('token');

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
      title: 'Phone',
      dataIndex: 'phone',
      render: (_, record) => (record?.phone ? record?.phone : '-'),
    },
    {
      title: 'Company',
      dataIndex: 'company',
      render: (_, record) => (
       <>
       {record?.company?.name ? record?.company?.name : '-'}
       </>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      render: (_, record) => (
        <ThreeDotsDropdown onDelete={() => null} onEdit={() => null} />
      ),
    },
  ];

  // rowSelection object indicates the need for row selection
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys) => {
      setSelectedRowKeys(selectedRowKeys);
    },
  };

  useEffect(() => {
    // Set default form layout with one driver row when modal opens
    if (AddModal && formLayout.length === 0) {
      setFormLayout([{ id: uuidv4(), email: '', phone: '', name: '', role: 'driver' }]);
    }
  }, [AddModal]);

  const addFormLayout = () => {
    // Update formValues with current form data
    formLayout.forEach((item) => {
      const values = form.getFieldsValue();
      setFormValues(prev => ({
        ...prev,
        [`email_${item.id}`]: values[`email_${item.id}`] || '',
        [`phone_${item.id}`]: values[`phone_${item.id}`] || '',
        [`name_${item.id}`]: values[`name_${item.id}`] || '',
        [`role_${item.id}`]: values[`role_${item.id}`] || 'driver',
      }));
    });

    setFormLayout([
      ...formLayout,
      { id: uuidv4(), email: '', phone: '', name: '', role: 'driver' }
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
      return !email || !name || !phone ||  !role;
    }));
  };

  useEffect(() => {
    formLayout.forEach((item) => {
      form.setFieldsValue({
        [`email_${item.id}`]: formValues[`email_${item.id}`] || '',
        [`phone_${item.id}`]: formValues[`phone_${item.id}`] || '',
        [`role_${item.id}`]: formValues[`role_${item.id}`] || 'driver',
      });
    });
  }, [formLayout, formValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const addDriverPromises = formLayout.map((item) => {
        const email = values[`email_${item.id}`];
        const phone = values[`phone${item.id}`];
        const name = values[`name_${item.id}`];
        const role =  'manager';

        return post('/users', { email, phone, name, role });
      });

      await Promise.all(addDriverPromises);
      message.success('Manager added successfully!');
      fetchUsers(currentPage, pageSize);
      setAddModal(false);
      form.resetFields();
      setFormLayout([]);
      setFormValues({});
    } catch (error) {
      console.error('Error:', error);
      if (error.response && error.response.data) {
        message.error(`Error: ${error.response.data.message}`);
      } else {
        message.error('An error occurred while adding manager. Please try again.');
      }
    }
  };
  const fetchUsers = async (page = 1, limit = 10) => {
    try {
      const response = await get('/users?role=manager', {
        page, limit 
      });
      const usersWithKeys = response.results.map(user => ({ ...user, key: user.id }));
      setGetAllUsers(usersWithKeys);
      setTotalResults(response.totalResults);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Error fetching users:', error);
      message.error('An error occurred while fetching users. Please try again.');
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
  

  const handleViewMore = (record) => {
    setSelectedUser(record);
    setViewModal(true);
  };

  const handleMultiRowDelete = async (selectedRowKeys) => {
    try {
      const deletePromises = selectedRowKeys.map((userId) =>
        remove(`/users/${userId}`)
      );
      await Promise.all(deletePromises);
      message.success('Selected users deleted successfully');
      // Remove the deleted users from the state
      setGetAllUsers(getAllUsers.filter((user) => !selectedRowKeys.includes(user.key)));
      setSelectedRowKeys([]);
    } catch (error) {
      console.error('Error deleting users:', error);
      message.error('An error occurred while deleting users. Please try again.');
    }
  };

  return (
    <div className={props.class} style={{ height: "100%" }}>
      <Header />
      <Col lg={24} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ fontSize: "25px", color: "#0B5676", letterSpacing: "1px", fontWeight: "600",  marginBottom: '10px' }}>Managers</h3>
        <div style={{ display: "flex", gap: "6px" }}>
          {selectedRowKeys?.length > 0 && 
          <Button onClick={() => handleMultiRowDelete(selectedRowKeys)} style={{ background: "#1FA6E0", width: "100%", height: "40px", color: "#fff" }}>Delete</Button>}
          {!(getAllUsers.length === 0) && <Button onClick={() => setAddModal(true)} style={{ background: "#1FA6E0", width: "100%", height: "40px", color: "#fff" }}>+ Add</Button>}
        </div>
      </Col>
      {
      !loading ?
      !(getAllUsers.length > 0) ? 
      <Col lg={24} style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80%" }}>
        <Col lg={10} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ textAlign: "center", color: "#BBBBBB", fontWeight: "600" }}>Looks like you have no managers yet.</div>
          <div style={{ textAlign: "center", color: "#BBBBBB", fontWeight: "400" }}>Add a manager and we will send them an invite to join your team.</div>
          <Button onClick={() => setAddModal(true)} style={{ background: "#1FA6E0", width: "100%", height: "40px", color: "#fff" }}> + Add</Button>
        </Col>
      </Col>
      :
      // <div className='TableStyle'>
      <Table
      rowSelection={rowSelection}
      columns={columns}
      dataSource={getAllUsers}
      pagination={{
        current: currentPage,
        pageSize: pageSize,
        total: totalResults,
        onChange: (page, pageSize) => handleTableChange({ current: page, pageSize }),
      }}
      style={{ height: "60vh", overflowY: "auto" }}
      onChange={handleTableChange}
      className="fixed-pagination"
    />
    
    // </div>
    
 : <Skeleton active/>
      }
      <Modal
        title='Add Manager'
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
                    name={`name_${item.id}`}
                    label={<div style={{ color: "#BBBBBB" }}>Name</div>}
                    rules={[{ required: true, message: 'Please enter name' }]}
                  >
                    <Input style={{ width: "250px" }} placeholder="Enter Name" />
                  </Form.Item>
                  <Form.Item
                    name={`email_${item.id}`}
                    label={<div style={{ color: "#BBBBBB" }}>Email</div>}
                    rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}
                  >
                    <Input style={{ width: "250px" }} placeholder="Enter Email" />
                  </Form.Item>
                  <Form.Item
                    name={`phone_${item.id}`}
                    label={<div style={{ color: "#BBBBBB" }}>Phone No</div>}
                    rules={[{ required: true, message: 'Please enter phone no.' }]}
                  >
                    <Input style={{ width: "250px" }} placeholder="Enter Phone Number" />
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
                Add Manager
              </Button>
            </div>
          </Form>
        </div>
      </Modal>
      <Modal
        title='Manager Details'
        open={viewModal}
        onCancel={() => setViewModal(false)}
        footer={null}
      >
        {selectedUser && (
          <div>
            <p><strong>Name:</strong> {selectedUser.firstName} {selectedUser.lastName}</p>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Role:</strong> {selectedUser.role}</p>
            {selectedUser.driverN && <p><strong>Driver No.:</strong> {selectedUser.driverN}</p>}
            {selectedUser.truckN && <p><strong>Truck No.:</strong> {selectedUser.truckN}</p>}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Managers;
