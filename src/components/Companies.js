import React, { useState, useEffect } from 'react';
import Header from './Header';
import { Col, Button, Modal, Form, Input, Upload, message, Table, Skeleton, Image, Select, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { get, post, remove, updatePatch } from "../utility/httpService"; // Make sure to implement these methods
import ThreeDotsDropdown from '../sharedComponents/DropDown';
import axios from 'axios';

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
  const [uploadImg , setUploadImg] = useState("");
  const [managers, setManagers] = useState([])
  const [imageLoading, setImageLoading] = useState(false);

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
       text === 'N/A' ? '-' : <img src={text} alt="Company Logo" style={{ width: 50, height: 50 }} />
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
      render: (text) => text?.firstName ? text?.firstName+' '+text?.lastName : '-',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <ThreeDotsDropdown
          onDelete={() => handleDelete(record.id)}
          onEdit={() => handleEdit(record)}
        />
      ),
    },
  ];

  // const rowSelection = {
  //   selectedRowKeys,
  //   onChange: (selectedRowKeys) => {
  //     setSelectedRowKeys(selectedRowKeys);
  //   },
  // };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
  
      const updateData = {
        name: values?.name,
        logo: uploadImg ? uploadImg : 'N/A',  
        type: values?.type,
      };

      if(values.manager){
        updateData.manager = values?.manager
      }
  
      await updatePatch(`/companies/${editCompany.id}`, updateData);
      message.success('Company updated successfully!');
      fetchUsers(currentPage, pageSize);
      setEditModal(false);
      form.resetFields();
      setUploadImg("")
    } catch (error) {
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
  
      const newCompanyData = {
        name: values.name,
        logo: uploadImg ? uploadImg : 'N/A',  
        type: values.type,
      };

      if(values.manager){
        newCompanyData.manager = values.manager
      }
  
     await post('/companies', newCompanyData);
      message.success('Company added successfully!');
      fetchUsers(currentPage, pageSize);
      setAddModal(false);
      form.resetFields();
      setUploadImg("")
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

  const handleEdit = (company) => {
    form.setFieldsValue({
      name: company?.name,
      type: company?.type,
      manager: company?.manager?.id,
    });
    setEditCompany(company)
    setUploadImg(company.logo !== 'N/A' ? company?.logo  : '')
    setEditModal(true);
  };

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


  const customRequest = ({ file, onSuccess, onError }) => {
    const formData = new FormData();
    formData.append('logo', file);
    setImageLoading(true)
    axios.post('https://api.healmefit.io/v1/companies/upload-logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', 
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
      },
    })
    .then(response => {
      setUploadImg(response?.data?.logoPath)
      onSuccess(response?.data?.logoPath);
      message.success(`${file.name} file uploaded successfully.`);
      setImageLoading(false)
    })
    .catch(error => {
      onError(error);
      setImageLoading(false)
      message.error(`${file.name} file upload failed.`);
    });
  };

    // Fetch list of companies
    const getManagersList = async () => {
      try {
        const response = await get('/users?role=manager');
        console.log(response)
        setManagers(response?.data?.results || []);
      } catch (error) {
        message.error('An error occurred while fetching companies.');
      }
    };

    useEffect(() => {
      getManagersList()
    },[])
  

  return (
    <div className={props.class} style={{ height: "100%" }}>
      <Header />
      <Col lg={24} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: '2%' }}>
        <h2 style={{ fontSize: "25px", color: "#0B5676", letterSpacing: "1px", fontWeight: "600", marginBottom: '10px' }}>Companies</h2>
        <div style={{ display: "flex", gap: "6px" }}>
          {totalResults.length > 0 && <Button onClick={() => setAddModal(true)} style={{ background: "#1FA6E0", width: "100%", height: "40px", color: "#fff" }}>+ Add Company</Button>}
        </div>
      </Col>
      {
      !loading ?
      totalResults.length === 0 ? 
      <Col lg={24} style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80%" }}>
        <Col lg={10} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ textAlign: "center", color: "#BBBBBB", fontWeight: "600" }}>Looks like you have no company yet.</div>
          <div style={{ textAlign: "center", color: "#BBBBBB", fontWeight: "400" }}>Add a company and we will send them an invite to join your team.</div>
          <Button onClick={() => setAddModal(true)} style={{ background: "#1FA6E0", width: "100%", height: "40px", color: "#fff" }}> + Add Company</Button>
        </Col>
      </Col>
      :
      <Table
        // rowSelection={rowSelection}
        columns={columns}
        dataSource={totalResults}
        pagination={{
            current: currentPage,
            pageSize: pageSize,
            onChange: (page, pageSize) => {
              setCurrentPage(page);
              setPageSize(pageSize)
            },
        }}
      />
      :
      <Skeleton active />
      }
      <Modal
        title='Add Company'
        open={AddModal}
        width={600}
        onCancel={() => { setAddModal(false); form.resetFields(); }}
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
            >
               {imageLoading && (
                <div style={{ marginTop: 16 }}>
                  <Spin tip="Uploading..." /> {/* Ant Design Spin component for loading */}
                </div>
              )}

             {uploadImg === ""  ? <Upload
                name="logo"
                customRequest={customRequest}
                showUploadList={false}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />}>Upload</Button>
              </Upload> : (
                <div style={{ marginTop: 16 }}>
                  <Image
                    width={150}
                    height={150}
                    src={uploadImg}
                    alt="Uploaded Image Preview"
                  />
                  <p style={{cursor: 'poiinter'}} onClick={() => setUploadImg("")}>Click here to remove the Image</p>
                </div>
              )}
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
              rules={[{ required: false, message: 'Select input the manager!' }]}
            >
              <Select
                  name={"manager"}
                  placeholder="Select Manager"
                >
                  <Select.Option value="">None</Select.Option>
                  {managers?.map(obj => (
                    <Select.Option key={obj.id} value={obj.id}>
                      {obj?.firstName+' '+obj?.lastName}
                    </Select.Option>
                  ))}
                </Select>
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
               {imageLoading && (
                <div style={{ marginTop: 16 }}>
                  <Spin tip="Uploading..." /> {/* Ant Design Spin component for loading */}
                </div>
              )}

             {uploadImg === ""  ? <Upload
                name="logo"
                customRequest={customRequest}
                showUploadList={false}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />}>Upload</Button>
              </Upload> : (
                <div style={{ marginTop: 16 }}>
                  <Image
                    width={150}
                    height={150}
                    src={uploadImg}
                    alt="Uploaded Image Preview"
                  />
                  <p style={{cursor: 'poiinter'}} onClick={() => setUploadImg("")}>Click here to remove the Image</p>
                </div>
              )}
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
              rules={[{ required: false, message: 'Select input the manager!' }]}
            >
              <Select
                  name={"manager"}
                  placeholder="Select Manager"
                >
                  <Select.Option value="">None</Select.Option>
                  {managers?.map(obj => (
                    <Select.Option key={obj.id} value={obj.id}>
                      {obj?.firstName+' '+obj?.lastName}
                    </Select.Option>
                  ))}
                </Select>
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
