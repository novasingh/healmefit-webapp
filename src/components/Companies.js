import React, { useState, useEffect } from 'react';
import Header from './Header';
import { Col, Button, Modal, Form, Input, Upload, message, Table, Skeleton } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { get, post, remove, updatePatch } from "../utility/httpService"; // Make sure to implement these methods
import ThreeDotsDropdown from '../sharedComponents/DropDown';

const Companies = (props) => {
  const [form] = Form.useForm();
  const [AddModal, setAddModal] = useState(false);
  const [EditModal, setEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalResults, setTotalResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [editCompany, setEditCompany] = useState(null);

  const columns = [
    {
      title: 'Company Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Company Logo',
      dataIndex: 'logo',
      key: 'logo',
      render: (text) => (
        <img src={text} alt="Company Logo" style={{ width: 50, height: 50 }} />
      ),
    },
    {
      title: 'Company Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Company Manager',
      dataIndex: 'manager',
      key: 'manager',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <ThreeDotsDropdown
          onDelete={() => handleDelete(record.key)}
          onEdit={() => handleEdit(record)}
        />
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys) => {
      setSelectedRowKeys(selectedRowKeys);
    },
  };

  const handleLogoUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await post('/companies/upload-logo', formData); // Adjust the API endpoint as needed
      return response.data.url; // Assuming the response contains the uploaded file URL
    } catch (error) {
      message.error('Failed to upload logo');
      throw error;
    }
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      
      // Check if logo field exists and is valid
      let logoUrl = editCompany.logo;
      if (values.logo && values.logo.file && values.logo.file.originFileObj) {
        logoUrl = await handleLogoUpload(values.logo.file.originFileObj);
      }
  
      const updatedCompanyData = {
        name: values.name,
        logo: logoUrl ? logoUrl : 'N/A',  // Ensure logo is not empty
        type: values.type,
        manager: values.manager,
      };
  
      await updatePatch(`/companies/${editCompany.key}`, updatedCompanyData);
      message.success('Company updated successfully!');
      fetchUsers(currentPage, pageSize);
      setEditModal(false);
      form.resetFields();
      setEditCompany(null);
    } catch (error) {
      console.error('Error:', error);
      if (error.response && error.response.data) {
        message.error(`Error: ${error.response.data.message}`);
      } else {
        message.error('An error occurred while updating the company. Please try again.');
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Check if logo field exists and is valid
      let logoUrl = '';
      // if (values.logo && values.logo.file && values.logo.file.originFileObj) {
      //   logoUrl = await handleLogoUpload(values.logo.file.originFileObj);
      // }
  
      const newCompanyData = {
        name: values.name,
        logo: logoUrl ? logoUrl : 'N/A',  // Ensure logo is not empty
        type: values.type,
        // manager: values.manager,
      };
  
     const response = await post('/companies', newCompanyData);  // Adjust the API endpoint as needed
     console.log(response)
      message.success('Company added successfully!');
      fetchUsers(currentPage, pageSize);
      setAddModal(false);
      form.resetFields();
    } catch (error) {
      console.error('Error:', error);
      if (error.response && error.response.data) {
        message.error(`Error: ${error.response.data.message}`);
      } else {
        message.error('An error occurred while adding the company. Please try again.');
      }
    }
  };

  const handleDelete = async (companyId) => {
    try {
      await remove(`/companies/${companyId}`);
      message.success('Company deleted successfully');
      fetchUsers(currentPage, pageSize);
    } catch (error) {
      console.error('Error deleting company:', error);
      message.error('An error occurred while deleting the company. Please try again.');
    }
  };

  const handleMultiRowDelete = async () => {
    try {
      const deletePromises = selectedRowKeys.map((companyId) =>
        remove(`/companies/${companyId}`)
      );
      await Promise.all(deletePromises);
      message.success('Selected companies deleted successfully');
      fetchUsers(currentPage, pageSize);
      setSelectedRowKeys([]);
    } catch (error) {
      console.error('Error deleting companies:', error);
      message.error('An error occurred while deleting companies. Please try again.');
    }
  };
  
  const handleEdit = (company) => {
    setEditCompany(company);
    form.setFieldsValue({
      name: company.name,
      type: company.type,
      manager: company.manager,
      logo: company.logo ? company.logo  : 'N/A'
    });
    setEditModal(true);
  };
  console.log(totalResults)
  const fetchUsers = async (page = 1, limit = 10) => {
    try {
      const response = await get('/companies', { page, limit });
     
      setTotalResults(response.data || []);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Error fetching companies:', error);
      message.error('An error occurred while fetching companies. Please try again.');
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

  return (
    <div className={props.class} style={{ height: "100%" }}>
      <Header />
      <Col lg={24} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ fontSize: "25px", color: "#0B5676", letterSpacing: "1px", fontWeight: "600", marginBottom: '10px' }}>Companies</h3>
        <div style={{ display: "flex", gap: "6px" }}>
          {selectedRowKeys.length > 0 &&
          <Button onClick={handleMultiRowDelete} style={{ background: "#1FA6E0", width: "100%", height: "40px", color: "#fff" }}>Delete</Button>}
          {totalResults.length > 0 && <Button onClick={() => setAddModal(true)} style={{ background: "#1FA6E0", width: "100%", height: "40px", color: "#fff" }}>+ Add</Button>}
        </div>
      </Col>
      {
      !loading ?
      totalResults.length === 0 ? 
      <Col lg={24} style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80%" }}>
        <Col lg={10} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ textAlign: "center", color: "#BBBBBB", fontWeight: "600" }}>Looks like you have no company yet.</div>
          <div style={{ textAlign: "center", color: "#BBBBBB", fontWeight: "400" }}>Add a company and we will send them an invite to join your team.</div>
          <Button onClick={() => setAddModal(true)} style={{ background: "#1FA6E0", width: "100%", height: "40px", color: "#fff" }}> + Add</Button>
        </Col>
      </Col>
      :
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={totalResults}
        pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalResults.length,
            onChange: (page, pageSize) => handleTableChange({ current: page, pageSize }),
        }}
      />
      :
      <Skeleton active />
      }
      <Modal
        title='Add Company'
        open={AddModal}
        width={600}
        onCancel={() => setAddModal(false)}
        destroyOnClose
        centered
        footer={null}
      >
        <div style={{ padding: "10px" }}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="name"
              label="Company Name"
              rules={[{ required: true, message: 'Please input the company name!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="logo"
              label="Company Logo"
              valuePropName="file"
              getValueFromEvent={({ file }) => file}
              extra="Upload a logo for the company"
            >
              <Upload
                name="logo"
                beforeUpload={() => false}
                customRequest={({ file, onSuccess }) => {
                  handleLogoUpload(file).then(url => {
                    form.setFieldsValue({ logo: url });
                    onSuccess(null, file);
                  }).catch(err => console.error(err));
                }}
                showUploadList={false}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />}>Upload</Button>
              </Upload>
            </Form.Item>
            <Form.Item
              name="type"
              label="Type"
              rules={[{ required: true, message: 'Please select the company type!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="manager"
              label="Manager"
              rules={[{ required: false, message: 'Please input the manager!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">Add Company</Button>
            </Form.Item>
          </Form>
        </div>
      </Modal>
      <Modal
        title='Edit Company'
        open={EditModal}
        width={600}
        onCancel={() => setEditModal(false)}
        destroyOnClose
        centered
        footer={null}
      >
        <div style={{ padding: "10px" }}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleUpdate}
          >
            <Form.Item
              name="name"
              label="Company Name"
              rules={[{ required: true, message: 'Please input the company name!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="logo"
              label="Company Logo"
              valuePropName="file"
              getValueFromEvent={({ file }) => file}
              extra="Upload a logo for the company"
            >
              <Upload
                name="logo"
                beforeUpload={() => false}
                customRequest={({ file, onSuccess }) => {
                  handleLogoUpload(file).then(url => {
                    form.setFieldsValue({ logo: url });
                    onSuccess(null, file);
                  }).catch(err => console.error(err));
                }}
                showUploadList={false}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />}>Upload</Button>
              </Upload>
            </Form.Item>
            <Form.Item
              name="type"
              label="Type"
              rules={[{ required: true, message: 'Please select the company type!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="manager"
              label="Manager"
              rules={[{ required: true, message: 'Please input the manager!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">Update Company</Button>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default Companies;
