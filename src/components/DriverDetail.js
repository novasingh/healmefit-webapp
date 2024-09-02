import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Modal, Select, message, Table, Tooltip, Collapse, Spin, Col } from 'antd';
import Chart from 'react-apexcharts';
import { DownloadOutlined } from '@ant-design/icons';
import PhoneInput from 'react-phone-input-2';
import { get, post } from '../utility/httpService';
import { useParams } from 'react-router-dom';
import { useCallback } from 'react';
import { calculateHealthScore, calculateSleepPercentage, convertDecimalHours } from '../utility/utils';
import Header from './Header';

const { Option } = Select;

const DriverDetail = () => {
  const { Panel } = Collapse;
  const  { id } = useParams();
  const [loading , setLoading] = useState(false);
  const [profileData, setProfileData] = useState({});
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState('');
  const [description, setDescription] = useState('');


  const fetchDriverDetails = useCallback(async () => {
    try {
      const driverAPI = get(`/users/${id}`);
      const documentAPI = get(`/document/${id}/documents`);
      Promise.all([driverAPI, documentAPI])
        .then((responses) => {
          setProfileData(responses[0].data);
          setUploadedDocuments(responses[1].data);
          setLoading(false);
        })
        .catch((error) => {
          setLoading(false);
          console.error("Error in one of the requests:", error);
        });
    } catch (error) {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      setLoading(true)
      fetchDriverDetails();
    }
  }, [fetchDriverDetails, id]);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    if (selectedDocument && description) {
      try {
        const response = await post('/notifications/request-upload', {
          managerId: JSON.parse(sessionStorage.getItem('user')).id,
          driverId: profileData.id,
          documentName: selectedDocument,
          documentDescription: description,
          expireDate: new Date().toISOString(),
        });

        if (response.status === 200) {
          message.success('Document request sent successfully.');
          setIsModalVisible(false);
          setSelectedDocument('');
          setDescription('');
        } 
      } catch (error) {
        message.error('An error occurred while sending the document request.');
        console.error(error);
      }
    } else {
      message.error('Please select a document and enter a description.');
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedDocument('');
    setDescription('');
  };

  const heartRate =profileData?.healthData?.heartRate || 61;
  const heartRatePercentage = (heartRate / 100) * 100;

  const avgSteps = (profileData?.healthData?.steps / 10000) * 100;

  const chartOptions = {
    series: [
      heartRatePercentage,
      calculateSleepPercentage(profileData?.healthData?.sleep),
      Math.round((profileData?.healthData?.bmi /25) * 100).toFixed(2),
      avgSteps > 100 ? 100 : Math.round(avgSteps),
    ],
    options: {
      chart: {
        type: 'radialBar',
      },
      plotOptions: {
        radialBar: {
          dataLabels: {
            name: {
              fontSize: '22px',
            },
            value: {
              fontSize: '16px',
            },
            total: {
              show: true,
              label: 'Health Score',
              formatter: () => {
                return profileData?.healthData?.healthScore?.healthScore ?  Math.round(profileData?.healthData?.healthScore?.healthScore * 100) : '-';
              },
            },
          },
        },
      },
      labels: ['Heart Rate', 'Sleep', 'BMI', 'Steps'],
      colors: ["#96ACFA", "#0B5676", "#1FA6E0", "#CAE427"],
    },
  };

  const documentColumns = [
    { title: 'Document Name', dataIndex: 'name', key: 'name' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    {
      title: 'Actions',
      key: 'actions',
      width: '150px',
      render: (_, record) =>
        record.name ? (
          <Tooltip title="Download">
            <Button type="primary" onClick={() => window.open(record.fileUrl, "_blank")} icon={<DownloadOutlined />} />
          </Tooltip>
        ) : null,
    },
  ];

  return loading ? (
    <Col
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
    }}
  >
    <Spin />
  </Col>
  ) : profileData?.id && (
    <div>
       <Header />
      {/* Personal Info and Company Info Panels */}
      <div style={{marginTop: '15px'}}>
        <Collapse defaultActiveKey={['1', '2']} expandIconPosition="end">
          <Panel header={<h4 style={{ color: '#0B5676' }}>Personal Info</h4>} key="1">
            {profileData?.id && 
            <Form
              layout="vertical"
              style={{ justifyContent: 'space-between', display: 'flex', flexWrap: 'wrap', gap: '20px' }}
            >
              <Form.Item label={<div style={{ color: "#BBBBBB" }}>First Name</div>} name="firstName">
                  <Input style={{ width: "300px", color: "#000" }} placeholder="Enter First Name" defaultValue={profileData?.firstName}  disabled />
                </Form.Item>
                <Form.Item label={<div style={{ color: "#BBBBBB" }}>Last Name</div>} name="lastName">
                  <Input style={{ width: "300px", color: "#000" }} placeholder="Enter Last Name" defaultValue={profileData?.lastName} disabled />
                </Form.Item>
                <Form.Item label={<div style={{ color: "#BBBBBB" }}>Email</div>} name="email">
                  <Tooltip title="Email can't be edited">
                    <Input
                      style={{
                        width: "300px",
                        color: "#333",
                        backgroundColor: "#f5f5f5",
                        cursor: "not-allowed",
                      }}
                      defaultValue={profileData?.email}
                      disabled
                    />
                  </Tooltip>
                </Form.Item>
                <Form.Item label={<div style={{ color: "#BBBBBB" }}>Phone</div>} name="phone">
                  <PhoneInput
                    country={'us'}
                    enableSearch={true}
                    containerStyle={{ width: "300px" }}
                    inputStyle={{ width: "100%", color: "#000" }}
                    placeholder="Enter Phone Number"
                    value={profileData?.phone}
                    disabled={true}
                  />
                </Form.Item>
                <Form.Item label={<div style={{ color: "#BBBBBB" }}>Address</div>} name="address">
                  <Input style={{ width: "300px", color: "#000" }} placeholder="Enter Address" defaultValue={profileData?.email} disabled />
                </Form.Item>
            </Form>}
          </Panel>
          <Panel header={<h4 style={{ color: '#0B5676' }}>Company Info</h4>} key="2">
            <Form
              layout="vertical"
              style={{ justifyContent: 'space-between', display: 'flex', flexWrap: 'wrap', gap: '20px' }}
            >
              <Form.Item label={<div style={{ color: "#BBBBBB" }}>Truck Number</div>} name="truckN">
                    <Input style={{ width: "300px", color: "#000" }} placeholder="Enter Truck Number" defaultValue={profileData?.truckN} disabled />
                  </Form.Item>
                  <Form.Item label={<div style={{ color: "#BBBBBB" }}>Driver Number</div>} name="driverN">
                    <Input style={{ width: "300px", color: "#000" }} placeholder="Enter Driver Number" defaultValue={profileData?.driverN} disabled />
                  </Form.Item>
                  <Form.Item label={<div style={{ color: "#BBBBBB" }}>License Plate</div>} name="licensePlate">
                    <Input style={{ width: "300px", color: "#000" }} placeholder="Enter License Plate" defaultValue={profileData?.licensePlate} disabled />
                  </Form.Item>
                  <Form.Item label={<div style={{ color: "#BBBBBB" }}>Insurance Number</div>} name="insuranceN">
                    <Input style={{ width: "300px", color: "#000" }} placeholder="Enter Insurance Number" defaultValue={profileData?.insuranceN} disabled />
                  </Form.Item>
            </Form>
          </Panel>
        </Collapse>
      </div>

      {/* Uploaded Documents */}
      <div style={{ marginTop: '20px' }}>
       <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
       <h2 style={{ color: '#1FA6E0' }}>Uploaded Documents</h2>
        <Button
          type="primary"
          onClick={showModal}
          style={{
            height: '40px',
            margintop: '80px',
            backgroundcolor: '#fff',
            border: '1.5px solid #1FA6E0',
            fontWeight: '600',
          }}
        >
          Request a Document
        </Button>
       </div>
        <Table columns={documentColumns} dataSource={uploadedDocuments} pagination={false} rowKey="id" />
      </div>

      {/* Health Metrics in Grid */}
      <div style={{ marginTop: '20px' }}>
        <h2 style={{ color: '#0B5676' }}>Driver Health Metrics</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginTop: '15px' }}>
          <div>
            <h2>Heart Rate</h2>
            <p style={{fontSize: '18px', fontWeight: 600}}>{profileData?.healthData?.heartRate ? `${profileData?.healthData?.heartRate}/min bpm` : 'No data available'}</p>
          </div>
          <div>
            <h2>Sleep</h2>
            <p style={{fontSize: '18px', fontWeight: 600}}>{profileData?.healthData?.sleep ? `${convertDecimalHours(profileData?.healthData?.sleep)}` : 'No data available'}</p>
          </div>
          <div>
            <h2>BMI</h2>
            <p style={{fontSize: '18px', fontWeight: 600}}>{profileData?.healthData?.bmi ? `${profileData?.healthData?.bmi}` : 'No data available'}</p>
          </div>
          <div>
            <h2>Steps</h2>
            <p style={{fontSize: '18px', fontWeight: 600}}>{profileData?.healthData?.steps ? `${profileData?.healthData?.steps} steps` : 'No data available'}</p>
          </div>
        </div>

        {/* Charts */}
        <div style={{ marginTop: '20px' }}>
          {profileData?.healthData?.heartRate || profileData?.healthData?.sleep || profileData?.healthData?.bmi || profileData?.healthData?.steps ? (
            <Chart options={chartOptions.options} series={chartOptions.series} type="radialBar" height={350} />
          ) : (
            <p>No data available to display charts</p>
          )}
        </div>
      </div>

      {/* Modal for Requesting Documents */}
      <Modal title="Request a Document" centered open={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <Form layout="vertical">
          <Form.Item label="Document Type">
            <Select
              value={selectedDocument}
              onChange={(value) => setSelectedDocument(value)}
              placeholder="Select a document type"
              allowClear
            >
              <Option value="ID">ID</Option>
              <Option value="Vaccination Proof">Passport</Option>
              <Option value="HR Form">HR Form</Option>
              <Option value="Driver License">Driver License</Option>
              <Option value="Resume">Resume</Option>
              <Option value="Medical Document">Medical Document</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Description">
            <Input.TextArea
              value={description}
              required
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DriverDetail;
