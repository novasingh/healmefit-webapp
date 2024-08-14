import React, { useState, useEffect, useCallback } from 'react';
import Header from './Header';
import '../style.css';
import { DeleteOutlined } from '@ant-design/icons';
import { Col, Button, Modal, Form, Input, message, Table, Skeleton } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import { get, post, remove } from "../utility/httpService";
import ThreeDotsDropdown from '../sharedComponents/DropDown';
import { useNavigate } from 'react-router-dom';

const Driver = (props) => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalResults, setTotalResults] = useState(0);
  const [formLayout, setFormLayout] = useState([{ id: uuidv4(), email: '', truckN: '', driverN: '', name: '', role: 'driver' }]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      render: (_, record) => (
        <a onClick={() => navigate(`/driver/health`)}>
          {`${record.firstName} ${record.lastName}`}
        </a>
      ),
    },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Driver N', dataIndex: 'driverN', render: (_, record) => record.driverN || '-' },
    { title: 'Truck N', dataIndex: 'truckN', render: (_, record) => record.truckN || '-' },
    {
      title: 'Action',
      dataIndex: 'action',
      render: (_, record) => (
        <ThreeDotsDropdown onDelete={() => handleDeleteUser(record?.id)} onEdit={() => null} emailId={record?.email} />
      ),
    },
  ];

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await get('/users?role=driver', { page: currentPage, limit: pageSize });
      setUsers(response?.data?.results?.map(user => ({ ...user, key: user.id })) || []);
      setTotalResults(response?.totalResults || 0);
    } catch (error) {
      message.error('An error occurred while fetching users. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  const handleDeleteUser = async(id) => {
    await remove(`/users/${id}`).then((response) => {
      if(response){
        message.success('Driver Deleted Successfully.')
        fetchUsers()
      }
    }, error => {
      console.log(error)
    })
  }


  useEffect(() => {
    if(currentPage && pageSize){
      fetchUsers();
    }
  }, [currentPage, fetchUsers, pageSize]);

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const addFormLayout = () => {
    setFormLayout([...formLayout, { id: uuidv4(), email: '', truckN: '', driverN: '', name: '', role: 'driver' }]);
  };

  const handleDeleteFormLayout = (id) => {
    setFormLayout(formLayout.filter(item => item.id !== id));
  };

  const handleFormChange = () => {
    const allFieldsFilled = formLayout.every(item => {
      const values = form.getFieldsValue([`email_${item.id}`, `name_${item.id}`, `truckN${item.id}`, `driverN${item.id}`]);
      return Object.values(values).every(value => !!value);
    });
    formLayout.length > 0 && form.setFieldsValue({ isAddMoreDisabled: !allFieldsFilled, isAddDriverDisabled: !allFieldsFilled });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const responses = await Promise.all(
        formLayout.map(item => post('/users', {
          email: values[`email_${item.id}`],
          truckN: values[`truckN${item.id}`],
          driverN: values[`driverN${item.id}`],
          name: values[`name_${item.id}`],
          role: 'driver',
        }))
      );
      const allSuccessful = responses.every(response => response.status === 201);
      if(allSuccessful){
        message.success('Drivers added successfully!');
        setAddModalVisible(false);
        form.resetFields();
        setFormLayout([{ id: uuidv4(), email: '', truckN: '', driverN: '', name: '', role: 'driver' }]);
        fetchUsers()
      }else {
        message.error('One or more requests failed.');
      }

    } catch (error) {
      message.error(`Error: ${error.response?.data?.message || 'An error occurred while adding drivers. Please try again.'}`);
    }
  };

  return (
    <div className={props.class} style={{ height: "100%" }}>
      <Header />
      <Col style={{ paddingTop: "2%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: "25px", color: "#0B5676", letterSpacing: "1px", fontWeight: "600", marginBottom: '10px' }}>Drivers</h2>
        {users.length > 0 && (
          <Button onClick={() => setAddModalVisible(true)} style={{ background: "#1FA6E0", height: "40px", color: "#fff" }}>+ Add Drivers</Button>
        )}
      </Col>
      {loading ? (
        <Skeleton active />
      ) : users.length === 0 ? (
        <Col lg={24} style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80%" }}>
          <Col lg={10} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ textAlign: "center", color: "#BBBBBB", fontWeight: "600" }}>Looks like you have no drivers yet.</div>
            <div style={{ textAlign: "center", color: "#BBBBBB", fontWeight: "400" }}>Add a driver and we will send them an invite to join your team.</div>
            <Button onClick={() => setAddModalVisible(true)} style={{ background: "#1FA6E0", height: "40px", color: "#fff" }}>+ Add Drivers</Button>
          </Col>
        </Col>
      ) : (
        <Table
          columns={columns}
          dataSource={users}
          pagination={{ current: currentPage, pageSize, total: totalResults }}
          onChange={handleTableChange}
          className="fixed-pagination"
        />
      )}
      <Modal
        title="Add Drivers"
        open={addModalVisible}
        width={900}
        onCancel={() => setAddModalVisible(false)}
        destroyOnClose
        centered
        footer={null}
      >
        <Form form={form} layout="vertical" onValuesChange={handleFormChange} onFinish={handleSubmit}>
          {formLayout.map(item => (
            <div key={item.id} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
               <Form.Item
                name={`name_${item.id}`}
                label="Name"
                rules={[{ required: true, message: 'Please enter name' }]}
              >
                <Input placeholder="Enter Name" />
              </Form.Item>
              <Form.Item
                name={`email_${item.id}`}
                label="Email"
                rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}
              >
                <Input placeholder="Enter Email" />
              </Form.Item>
              <Form.Item
                name={`driverN${item.id}`}
                label="Driver No."
                rules={[{ required: true, message: 'Please enter a Driver Number' }]}
              >
                <Input placeholder="Enter Driver Number" />
              </Form.Item>
              <Form.Item
                name={`truckN${item.id}`}
                label="Truck No."
                rules={[{ required: true, message: 'Please enter a Truck Number' }]}
              >
                <Input placeholder="Enter Truck Number" />
              </Form.Item>
              <DeleteOutlined onClick={() => handleDeleteFormLayout(item.id)} style={{ fontSize: '24px', cursor: 'pointer' }} />
            </div>
          ))}
          
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <Button onClick={addFormLayout} style={{ marginBottom: "10px", width: "265px" }}>
            Add More
          </Button>
          <Button
            htmlType="submit"
            style={{ background: "#1FA6E0", width: "265px", color: "#fff" }}
          >
            Add Driver
          </Button>

          </div>
        </Form>
      </Modal>
      <Modal
        title="User Details"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
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

export default Driver;
