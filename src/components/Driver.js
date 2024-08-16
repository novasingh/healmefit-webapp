import React, { useState, useEffect, useCallback } from 'react';
import Header from './Header';
import '../style.css';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Col, Button, Modal, Form, Input, message, Table, Skeleton, Select } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import { get, post, remove } from "../utility/httpService";
import ThreeDotsDropdown from '../sharedComponents/DropDown';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

const Driver = (props) => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalResults, setTotalResults] = useState(0);
  const [formLayout, setFormLayout] = useState([{ id: uuidv4(), email: '', truckN: '', driverN: '', name: '', company: '', role: 'driver' }]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);

  // New state for companies and selected company
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);

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
      title: 'Company',
      dataIndex: 'company',
      render: (_, record) => {
        return record?.company?.name ? record?.company?.name : '-';
      },
    },
    {
      title: 'Action',
      dataIndex: 'action',
      render: (_, record) => (
        <ThreeDotsDropdown onDelete={() => handleDeleteUser(record?.id)} onEdit={() => null} emailId={record?.email} />
      ),
    },
  ];

  // Fetch list of companies
  const fetchCompanies = async () => {
    try {
      const response = await get('/companies');
      setCompanies(response?.data || []);
    } catch (error) {
      message.error('An error occurred while fetching companies.');
    }
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await get('/users?role=driver', {
        page: currentPage,
        limit: pageSize,
        company: selectedCompany,  // Include the selected company
      });
      setUsers(response?.data?.results?.map(user => ({
        ...user,
        key: user.id,
        companyId: user.companyId  // Assuming users have a companyId field
      })) || []);
      setTotalResults(response?.totalResults || 0);
    } catch (error) {
      message.error('An error occurred while fetching users. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, selectedCompany]);

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

  useEffect(() => {
    fetchCompanies();  // Fetch companies on component mount
  }, []);

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const addFormLayout = () => {
    setFormLayout([...formLayout, { id: uuidv4(), email: '', truckN: '', driverN: '', name: '', company: '', role: 'driver' }]);
  };

  const handleDeleteFormLayout = (id) => {
    setFormLayout(formLayout.filter(item => item.id !== id));
  };

  const handleFormChange = () => {
    const allFieldsFilled = formLayout.every(item => {
      const values = form.getFieldsValue([`email_${item.id}`, `name_${item.id}`, `truckN${item.id}`, `driverN${item.id}`, `company_${item.id}`]);
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
          company: values[`company_${item.id}`],  // Use companyId to link the company
          role: 'driver',
        }))
      );
      const allSuccessful = responses.every(response => response.status === 201);
      if(allSuccessful){
        message.success('Drivers added successfully!');
        setAddModalVisible(false);
        form.resetFields();
        setFormLayout([{ id: uuidv4(), email: '', truckN: '', driverN: '', name: '', company: '', role: 'driver' }]);
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
        <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
        <Col>
        <Select
          placeholder="Select Company"
          style={{ width: 250 }}
          onChange={(value) => {
            setSelectedCompany(value === "none" ? null : value);
            setCurrentPage(1); // Reset to first page
          }}
        >
          <Select.Option value="none">None</Select.Option>
          {companies.map(company => (
            <Select.Option key={company.id} value={company.id}>
              {company.name}
            </Select.Option>
          ))}
        </Select>
      </Col>
      {users.length > 0 && (
          <Button onClick={() => setAddModalVisible(true)} style={{ background: "#1FA6E0", height: "40px", color: "#fff" }}>+ Add Drivers</Button>
        )}
        </div>
       
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
        visible={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        onOk={handleSubmit}
        okButtonProps={{ disabled: form.getFieldValue('isAddDriverDisabled') }}
        cancelButtonProps={{ disabled: form.getFieldValue('isAddDriverDisabled') }}
      >
        <Form
          form={form}
          onFieldsChange={handleFormChange}
        >
          {formLayout.map(item => (
            <Form.Item key={item.id}>
              <div style={{ marginBottom: "20px", padding: "15px", border: "1px solid #E6E6E6", borderRadius: "8px" }}>
                <Form.Item
                  name={`email_${item.id}`}
                  label="Email"
                  rules={[{ required: true, message: 'Please input email!' }]}
                >
                  <Input placeholder="Email" />
                </Form.Item>
                <Form.Item
                  name={`name_${item.id}`}
                  label="Name"
                  rules={[{ required: true, message: 'Please input name!' }]}
                >
                  <Input placeholder="Name" />
                </Form.Item>
                <Form.Item
                  name={`truckN${item.id}`}
                  label="Truck N"
                  rules={[{ required: true, message: 'Please input truck number!' }]}
                >
                  <Input placeholder="Truck Number" />
                </Form.Item>
                <Form.Item
                  name={`driverN${item.id}`}
                  label="Driver N"
                  rules={[{ required: true, message: 'Please input driver number!' }]}
                >
                  <Input placeholder="Driver Number" />
                </Form.Item>
                <Form.Item
                  name={`company_${item.id}`}
                  label="Company"
                  rules={[{ required: true, message: 'Please select company!' }]}
                >
                  <Select placeholder="Select Company">
                    {companies.map(company => (
                      <Option key={company.id} value={company.id}>
                        {company.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Button type="link" danger onClick={() => handleDeleteFormLayout(item.id)}>
                  <DeleteOutlined /> Delete
                </Button>
              </div>
            </Form.Item>
          ))}
          <Button
            type="dashed"
            onClick={addFormLayout}
            style={{ width: '100%' }}
            icon={<PlusOutlined />}
            disabled={form.getFieldValue('isAddMoreDisabled')}
          >
            Add More
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default Driver;
