import React, { useState, useEffect, useCallback, useContext } from "react";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Col,
  Button,
  Modal,
  Form,
  Input,
  message,
  Table,
  Skeleton,
  Select,
} from "antd";
import { v4 as uuidv4 } from "uuid";
import { get, post, remove, updatePatch } from "../../../utility/httpService";
import ThreeDotsDropdown from "../../../sharedComponents/DropDown";
import { Link } from "react-router-dom";
import { AuthContext } from "../../../contexts/AuthContext";

const { Option } = Select;

const Driver = () => {
  const { userData } = useContext(AuthContext);
  const [form] = Form.useForm();
  const [updateForm] = Form.useForm();
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalResults, setTotalResults] = useState(0);
  const [formLayout, setFormLayout] = useState([
    {
      id: uuidv4(),
      email: "",
      truckN: "",
      driverN: "",
      name: "",
      company: "",
      role: "driver",
    },
  ]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  // New state for companies and selected company
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      render: (_, record) => (
        <Link to={`/driver/${record.id}`}>
          {`${record.firstName} ${record.lastName}`}
        </Link>
      ),
    },
    { title: "Email", dataIndex: "email" },
    {
      title: "Driver N",
      dataIndex: "driverN",
      render: (_, record) => record.driverN || "-",
    },
    {
      title: "Truck N",
      dataIndex: "truckN",
      render: (_, record) => record.truckN || "-",
    },
    {
      title: "Company",
      dataIndex: "company",
      render: (_, record) => {
        return record?.company?.name ? record?.company?.name : "-";
      },
    },
    {
      title: "Health Score",
      dataIndex: "healthScore",
      render: (_, record) => {
        return record?.healthData?.healthScore?.healthScore ?  `${Math.round(+record?.healthData?.healthScore?.healthScore * 100)} - ${record?.healthData?.healthScore?.category}`  : "-";
      },
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (_, record) => (
        <ThreeDotsDropdown
          onDelete={() => handleDeleteUser(record?.id)}
          onEdit={() => selectedUserData(record)}
          emailId={record?.email}
        />
      ),
    },
  ];

  // Fetch list of companies
  const fetchCompanies = async () => {
    try {
      const response = await get("/companies", {
        limit: 1000,
      });
      setCompanies(response?.data?.results || []);
    } catch (error) {
      message.error("An error occurred while fetching companies.");
    }
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await get("/users?role=driver", {
        page: currentPage,
        limit: pageSize,
        company: userData?.role === 'admin' ? selectedCompany : userData?.company?.id,
        sortBy: 'createdAt:desc',
      });
      setUsers(
        response?.data?.results?.map((user) => ({
          ...user,
          key: user.id,
          companyId: user.companyId, // Assuming users have a companyId field
        })) || []
      );
      setTotalResults(response?.data?.totalResults || 0);
    } catch (error) {
      message.error(
        "An error occurred while fetching users. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, selectedCompany]);

  const handleDeleteUser = async (id) => {
    try {
      await remove(`/users/${id}`);
      message.success("Driver Deleted Successfully.");
      fetchUsers();
    } catch (error) {
      message.error("An error occurred while deleting the driver.");
    }
  };

  useEffect(() => {
    if (currentPage && pageSize) {
      fetchUsers();
    }
  }, [currentPage, fetchUsers, pageSize]);

  useEffect(() => {
    fetchCompanies(); // Fetch companies on component mount
  }, []);

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const addFormLayout = () => {
    setFormLayout([
      ...formLayout,
      {
        id: uuidv4(),
        email: "",
        truckN: "",
        driverN: "",
        name: "",
        company: "",
        role: "driver",
      },
    ]);
  };

  const handleDeleteFormLayout = (id) => {
    setFormLayout(formLayout.filter((item) => item.id !== id));
  };

  const handleFormChange = () => {
    const allFieldsFilled = formLayout.every((item) => {
      const values = form.getFieldsValue([
        `email_${item.id}`,
        `name_${item.id}`,
        `truckN${item.id}`,
        `driverN${item.id}`,
        `company_${item.id}`,
      ]);
      return Object.values(values).every((value) => !!value);
    });
    formLayout.length > 0 &&
      form.setFieldsValue({
        isAddMoreDisabled: !allFieldsFilled,
        isAddDriverDisabled: !allFieldsFilled,
      });
  };

  const selectedUserData = (data) => {
    updateForm.setFieldsValue({
      id: data?.id,
      email: data?.email,
      truckN: data?.truckN,
      driverN: data?.driverN,
      name: `${data?.firstName} ${data?.lastName}`,
      company: data?.company?.id,
      role: "driver",
    });
    setSelectedUser(data);
    setEditModalVisible(true);
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    setSelectedUser(null);
    updateForm.resetFields()
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const responses = await Promise.all(
        formLayout.map((item) =>
          post("/users", {
            email: values[`email_${item.id}`],
            truckN: values[`truckN${item.id}`],
            driverN: values[`driverN${item.id}`],
            name: values[`name_${item.id}`],
            company: userData?.role === 'admin' ? values[`company_${item.id}`] : userData?.company?.id,
            role: "driver",
          })
        )
      );
      const allSuccessful = responses.every(
        (response) => response.status === 201
      );
      if (allSuccessful) {
        message.success("Drivers added successfully!");
        setAddModalVisible(false);
        form.resetFields();
        setFormLayout([
          {
            id: uuidv4(),
            email: "",
            truckN: "",
            driverN: "",
            name: "",
            company: "",
            role: "driver",
          },
        ]);
        fetchUsers();
      } else {
        message.error("One or more requests failed.");
      }
    } catch (error) {
      message.error(
        `Error: ${
          error.response?.data?.message ||
          "An error occurred while adding drivers. Please try again."
        }`
      );
    }
  };

  const handleUpdate = async () => {
    try {
      const values = await updateForm.validateFields();
      const response = await updatePatch(`/users/${selectedUser.id}`, {
        email: values?.email,
        truckN: values?.truckN ? values?.truckN :  'N/A',
        driverN: values?.driverN ? values?.driverN  :  'N/A',
        firstName: values?.name?.split(' ').length > 0 ? values.name.split(' ')[0] : 'User',
        lastName: values?.name?.split(' ') ? values.name.split(' ')[1] : 'user',
        company: userData?.role === 'admin' ? values.company : userData?.company?.id,
      });
      if (response.status === 200) {
        message.success("Driver updated successfully!");
        closeEditModal();
        updateForm.resetFields()
        fetchUsers();
      } else {
        message.error("An error occurred while updating the driver.");
      }
    } catch (error) {
      message.error(
        `Error: ${
          error.response?.data?.message ||
          "An error occurred while updating the driver. Please try again."
        }`
      );
    }
  };

  return userData?.role !== 'driver' ? (
    <div style={{ height: "100%" }}>
      <Col
        style={{
          paddingTop: "2%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2
          style={{
            fontSize: "25px",
            color: "#0B5676",
            letterSpacing: "1px",
            fontWeight: "600",
            marginBottom: "10px",
          }}
        >
          Drivers
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <Col>
           {userData?.role === 'admin' && <Select
              placeholder="Select Company"
              style={{ width: 250 }}
              onChange={(value) => {
                setSelectedCompany(value === "none" ? null : value);
                setCurrentPage(1);
              }}
            >
              <Option value="none">None</Option>
              {companies.map((company) => (
                <Option key={company.id} value={company.id}>
                  {company.name}
                </Option>
              ))}
            </Select>}
          </Col>
          <Button
            type="primary"
            onClick={() => setAddModalVisible(true)}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <PlusOutlined />
            Add Driver
          </Button>
        </div>
      </Col>
      <Skeleton loading={loading}>
        <Table
          dataSource={users}
          columns={columns}
          pagination={{
            current: currentPage,
            pageSize,
            total: totalResults,
            onChange: (page, pageSize) => {
              setCurrentPage(page);
              setPageSize(pageSize)
            },
          }}
          onChange={handleTableChange}
        />
      </Skeleton>
      <Modal
        title="Add Driver"
        open={addModalVisible}
        footer={null}
        onCancel={() => setAddModalVisible(false)}
        width={1084}
        centered
      >
        <Form form={form} layout="vertical" onValuesChange={handleFormChange}>
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {formLayout.map((item, i) => (
            <div key={item.id} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <Form.Item name={`name_${item.id}`} rules={[{ required: true, message: 'Please input the name!' }]} style={{ flex: 1 }}>
                <Input placeholder='Name' />
              </Form.Item>
              <Form.Item name={`email_${item.id}`} rules={[{ required: true, type: 'email', message: 'Please input a valid email!' }]} style={{ flex: 1 }}>
                <Input placeholder='Email' />
              </Form.Item>
              <Form.Item name={`truckN${item.id}`} style={{ flex: 1 }}>
                <Input placeholder='Truck Number' />
              </Form.Item>
              <Form.Item name={`driverN${item.id}`}  style={{ flex: 1 }}>
                <Input placeholder='Driver Number' />
              </Form.Item>
              {userData?.role === 'admin' &&<Form.Item name={`company_${item.id}`} rules={[{ required: true, message: 'Please select a company!' }]} style={{ flex: 1 }}>
                <Select placeholder='Select Company'>
                  {companies?.map(company => (
                    <Select.Option key={company.id} value={company.id}>
                      {company.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>}
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
              >
                Add More
              </Button>
              <Button
                onClick={handleSubmit}
                style={{ background: "#1FA6E0", width: "265px", height: "40px", color: "#fff" }}
              >
                Add Driver
              </Button>
            </div>
      </Form>
      </Modal>
      <Modal
        title="Edit Driver"
        open={editModalVisible}
        onCancel={closeEditModal}
        onOk={handleUpdate}
        okText="Update Driver"
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
            label="Driver Number"
            name="driverN"
          >
            <Input placeholder="Enter driver number" />
          </Form.Item>
          <Form.Item
            label="Truck Number"
            name="truckN"
          >
            <Input placeholder="Enter truck number" />
          </Form.Item>
          {userData?.role === 'admin' && <Form.Item
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
          </Form.Item>}
        </Form>
      </Modal>
    </div>
  ) : (
    <Col style={{display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%'}}>
    <h1>You don't have access of this page.</h1>
    </Col>
  );
};

export default Driver;
