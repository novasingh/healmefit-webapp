import React, { useState, useEffect } from 'react';
import Header from './Header';
import { DeleteOutlined } from '@ant-design/icons';
import { Col, Button, Modal, Form, Input, message, Table, Skeleton, Select } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import { get, post, remove, updatePatch } from "../utility/httpService";
import ThreeDotsDropdown from '../sharedComponents/DropDown';
const { Option } = Select;

const Managers = () => {
  const [form] = Form.useForm();
  const [updateForm] = Form.useForm();
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalResults, setTotalResults] = useState(0);
  const [formLayout, setFormLayout] = useState([]);
  const [formValues, setFormValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [managers, setManagers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [isAddMoreDisabled, setIsAddMoreDisabled] = useState(true);
  const [isAddManagerDisabled, setIsAddManagerDisabled] = useState(true);
  
  const [companies, setCompanies] = useState([]); // Changed Companies to companies

  const fetchCompanies = async () => {
    try {
      const response = await get('/companies', { limit : 1000}); // Adjust the endpoint as needed
      setCompanies(response?.data?.results );
    } catch (error) {
      message.error('An error occurred while fetching companies. Please try again.');
    }
  };
  
  useEffect(() => {
    fetchCompanies();
  }, []);
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
      render: (_, record) => record?.phone || '-',
    },
    {
      title: 'Company',
      dataIndex: 'company',
      render: (_, record) => record?.company?.name ?  record?.company?.name : '-',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      render: (_, record) => (
        <ThreeDotsDropdown onDelete={() => handleDeleteUser(record.id)} onEdit={() => selectedUserData(record)} emailId={record.email} />
      ),
    },
  ];

  const fetchUsers = async (page = 1, limit = 10) => {
    try {
      const response = await get('/users?role=manager', { page, limit });
      const usersWithKeys = response.data.results.map(user => ({ ...user, key: user.id }));
      setManagers(usersWithKeys);
      setTotalResults(response.data.totalResults);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      message.error('An error occurred while fetching users. Please try again.');
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await remove(`/users/${id}`);
      message.success('Manager deleted successfully.');
      fetchUsers(currentPage, pageSize);
    } catch (error) {
      console.error('Error deleting user:', error);
      message.error('An error occurred while deleting the user. Please try again.');
    }
  };

  const addFormLayout = () => {
    updateFormValues();
    setFormLayout([...formLayout, { id: uuidv4(), email: '', phone: '', name: '', companyId: '', role: 'manager' }]);
  };

  const updateFormValues = () => {
    const values = form.getFieldsValue();
    setFormValues(prevValues =>
      formLayout.reduce((acc, item) => {
        acc[`email_${item.id}`] = values[`email_${item.id}`] || '';
        acc[`phone_${item.id}`] = values[`phone_${item.id}`] || '';
        acc[`name_${item.id}`] = values[`name_${item.id}`] || '';
        acc[`role_${item.id}`] = values[`role_${item.id}`] || 'manager';
        return acc;
      }, prevValues)
    );
  };

  const handleDeleteFormLayout = (id) => {
    setFormLayout(formLayout.filter(item => item.id !== id));
  };

  const handleFormChange = () => {
    const hasEmptyField = formLayout.some(item => {
      const email = form.getFieldValue(`email_${item.id}`);
      const name = form.getFieldValue(`name_${item.id}`);
      const phone = form.getFieldValue(`phone_${item.id}`);
      return !email || !name || !phone;
    });

    setIsAddMoreDisabled(hasEmptyField);
    setIsAddManagerDisabled(hasEmptyField);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const requests = formLayout.map(item => {
        const { id } = item;
        return post('/users', {
          email: values[`email_${id}`],
          phone: values[`phone_${id}`],
          name: values[`name_${id}`],
          companyId: values[`company_${id}`],
          role: 'manager',
        });
      });

      await Promise.all(requests);
      message.success('Manager added successfully!');
      fetchUsers(currentPage, pageSize);
      resetForm();
    } catch (error) {
      console.error('Error submitting form:', error);
      message.error('An error occurred while adding the manager. Please try again.');
    }
  };

  const resetForm = () => {
    setAddModalVisible(false);
    form.resetFields();
    setFormLayout([]);
    setFormValues({});
  };

  useEffect(() => {
    setLoading(true);
    fetchUsers(currentPage, pageSize);
  }, [currentPage, pageSize]);

  useEffect(() => {
    if (addModalVisible && formLayout.length === 0) {
      setFormLayout([{ id: uuidv4(), email: '', phone: '', name: '', role: 'manager' }]);
    }
  }, [addModalVisible, formLayout.length]);

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const selectedUserData = (data) => {
    updateForm.setFieldsValue({
      id: data?.id,
      email: data?.email,
      phone: data?.phone,
      name: `${data?.firstName} ${data?.lastName}`,
      company: data?.company?.id,
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
        company: values.company,
      });
      if (response.status === 200) {
        message.success("Manager updated successfully!");
        closeEditModal();
        updateForm.resetFields()
        fetchUsers();
      } else {
        message.error("An error occurred while updating the manager.");
      }
    } catch (error) {
      message.error(
        `Error: ${
          error.response?.data?.message ||
          "An error occurred while updating the manager. Please try again."
        }`
      );
    }
  };


  return (
    <div style={{ height: "100%" }}>
      <Header />
      <Col lg={24} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "2%" }}>
        <h2 style={{ fontSize: "25px", color: "#0B5676", fontWeight: "600", marginBottom: '10px' }}>Managers</h2>
        {managers.length > 0 && (
          <Button onClick={() => setAddModalVisible(true)} style={{ background: "#1FA6E0", color: "#fff" }}>+ Add Managers</Button>
        )}
      </Col>
      {!loading ? (
        managers.length > 0 ? (
          <Table
            columns={columns}
            dataSource={managers}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              onChange: (page, pageSize) => {
                setCurrentPage(page);
                setPageSize(pageSize)
              },
            }}
            onChange={handleTableChange}
            className="fixed-pagination"
          />
        ) : (
          <EmptyState onClick={() => setAddModalVisible(true)} />
        )
      ) : (
        <Skeleton active />
      )}
      <AddManagerModal
        visible={addModalVisible}
        form={form}
        formLayout={formLayout}
        isAddMoreDisabled={isAddMoreDisabled}
        isAddManagerDisabled={isAddManagerDisabled}
        handleChange={handleFormChange}
        handleSubmit={handleSubmit}
        handleDeleteFormLayout={handleDeleteFormLayout}
        addFormLayout={addFormLayout}
        onCancel={() => setAddModalVisible(false)}
        companies={companies} // Pass companies to AddManagerModal
      />
      {selectedUser && (
        <ManagerDetailsModal
          visible={viewModalVisible}
          user={selectedUser}
          onCancel={() => setViewModalVisible(false)}
        />
      )}
       <Modal
        title="Edit Manager"
        visible={editModalVisible}
        onCancel={closeEditModal}
        onOk={handleUpdate}
        okText="Update Manager"
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
                message: "Please input the phone!",
              },
            ]}
          >
            <Input placeholder="Enter phone number" />
          </Form.Item>
          <Form.Item
            label="Company"
            name="company"
            rules={[
              { required: true, message: "Please select a company!" },
            ]}
          >
            <Select placeholder="Select company">
              {companies.map((company) => (
                <Option key={company.id} value={company.id}>
                  {company.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

const EmptyState = ({ onClick }) => (
  <Col lg={24} style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80%" }}>
    <Col lg={10} style={{ textAlign: "center" }}>
      <div style={{ color: "#BBBBBB", fontWeight: "600" }}>Looks like you have no managers yet.</div>
      <div style={{ color: "#BBBBBB", fontWeight: "400" }}>Add a manager and we will send them an invite to join your team.</div>
      <Button onClick={onClick} style={{ background: "#1FA6E0", color: "#fff", marginTop: "12px" }}>+ Add</Button>
    </Col>
  </Col>
);

const AddManagerModal = ({ visible, form, formLayout, isAddMoreDisabled, isAddManagerDisabled, handleChange, handleSubmit, handleDeleteFormLayout, addFormLayout, onCancel, companies }) => (
  <Modal
    title='Add Manager'
    open={visible}
    width={900}
    onCancel={onCancel}
    destroyOnClose
    centered
    footer={null}
  >
    <div style={{ padding: "10px" }}>
      <Form form={form} layout="vertical" onValuesChange={handleChange} onFinish={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {formLayout.map((item) => (
            <div key={item.id} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <Form.Item name={`name_${item.id}`} rules={[{ required: true, message: 'Please input the name!' }]} style={{ flex: 1 }}>
                <Input placeholder='Name' />
              </Form.Item>
              <Form.Item name={`email_${item.id}`} rules={[{ required: true, type: 'email', message: 'Please input a valid email!' }]} style={{ flex: 1 }}>
                <Input placeholder='Email' />
              </Form.Item>
              <Form.Item name={`phone_${item.id}`} rules={[{ required: true, message: 'Please input the phone number!' }]} style={{ flex: 1 }}>
                <Input placeholder='Phone' />
              </Form.Item>
              <Form.Item name={`company_${item.id}`} rules={[{ required: true, message: 'Please select a company!' }]} style={{ flex: 1 }}>
                <Select placeholder='Select Company'>
                  {companies?.map(company => (
                    <Select.Option key={company.id} value={company.id}>
                      {company.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <div style={{ fontSize: '24px', cursor: 'pointer', marginBottom: '20px' }}>
                <DeleteOutlined onClick={() => handleDeleteFormLayout(item.id)} />
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
                disabled={isAddManagerDisabled}
              >
                Add Manager
              </Button>
            </div>
      </Form>
    </div>
  </Modal>
);


const ManagerDetailsModal = ({ visible, user, onCancel }) => (
  <Modal
    title='Manager Details'
    open={visible}
    onCancel={onCancel}
    footer={null}
  >
    <p>{user.firstName} {user.lastName}</p>
    <p>{user.email}</p>
    <p>{user.phone}</p>
    <p>{user.company?.name || '-'}</p>
  </Modal>
);

export default Managers;
