import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Modal, Select, message, Table, Tooltip, Collapse } from 'antd';
import Chart from 'react-apexcharts';
import { DownloadOutlined } from '@ant-design/icons';
import PhoneInput from 'react-phone-input-2';
import { get, post } from '../utility/httpService';

const { Option } = Select;

const DriverDetail = ({ driverId }) => {
  const [form] = Form.useForm();
  const { Panel } = Collapse;

  const [profileData, setProfileData] = useState({});
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState('');
  const [description, setDescription] = useState('');
  const [healthMetrics, setHealthMetrics] = useState({
    heartRate: null,
    sleep: null,
    bmi: null,
    steps: null,
  });

  useEffect(() => {
    if (driverId) {
      const fetchDriverDetails = async () => {
        try {
          const response = await get(`/drivers/${driverId}`);
          setProfileData(response.data.profileData);
          setUploadedDocuments(response.data.uploadedDocuments);
          setHealthMetrics(response.data.healthMetrics);
        } catch (error) {
          console.error('Error fetching driver details:', error);
          message.error('Failed to fetch driver details.');
        }
      };
      fetchDriverDetails();
    }
  }, [driverId]);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    if (selectedDocument && description) {
      try {
        const response = await post('/notifications/request-upload', {
          managerId: profileData.managerId,
          driverId: profileData.driverId,
          documentName: selectedDocument,
          documentDescription: description,
          expireDate: new Date().toISOString(),
        });

        if (response.status === 200) {
          message.success('Document request sent successfully.');
          setIsModalVisible(false);
          setSelectedDocument('');
          setDescription('');
        } else {
          message.error('Failed to send the document request.');
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

  const chartOptions = {
    series: [
      healthMetrics.heartRate || 0,
      healthMetrics.sleep || 0,
      healthMetrics.bmi || 0,
      healthMetrics.steps || 0,
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
                const totalScore =
                  (healthMetrics.heartRate +
                    healthMetrics.sleep +
                    healthMetrics.bmi +
                    healthMetrics.steps) /
                  4;
                return totalScore ? `${Math.round(totalScore)}%` : 'No Data';
              },
            },
          },
        },
      },
      labels: ['Heart Rate', 'Sleep', 'BMI', 'Steps'],
    },
  };

  const documentColumns = [
    { title: 'Document Name', dataIndex: 'name', key: 'name' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { title: 'Expires On', dataIndex: 'expiresOn', key: 'expiresOn' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) =>
        record.name ? (
          <Tooltip title="Download">
            <Button type="primary" icon={<DownloadOutlined />} />
          </Tooltip>
        ) : null,
    },
  ];

  return (
    <div>
      {/* Personal Info and Company Info Panels */}
      <div>
        <Collapse defaultActiveKey={['1', '2']} expandIconPosition="end">
          <Panel header={<h4 style={{ color: '#0B5676' }}>Personal Info</h4>} key="1">
            <Form
              form={form}
              initialValues={profileData}
              layout="vertical"
              style={{ justifyContent: 'space-between', display: 'flex', flexWrap: 'wrap', gap: '20px' }}
            >
              {/* Form Items for Personal Info */}
            </Form>
          </Panel>
          <Panel header={<h4 style={{ color: '#0B5676' }}>Company Info</h4>} key="2">
            <Form
              form={form}
              initialValues={profileData}
              layout="vertical"
              style={{ justifyContent: 'space-between', display: 'flex', flexWrap: 'wrap', gap: '20px' }}
            >
              {/* Form Items for Company Info */}
            </Form>
          </Panel>
        </Collapse>
      </div>

      {/* Uploaded Documents */}
      <div style={{ marginTop: '20px' }}>
        <h3 style={{ color: '#1FA6E0' }}>Uploaded Documents</h3>
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
        <Table columns={documentColumns} dataSource={uploadedDocuments} rowKey="id" />
      </div>

      {/* Health Metrics in Grid */}
      <div style={{ marginTop: '20px' }}>
        <h3 style={{ color: '#0B5676' }}>Driver Health Metrics</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          <div>
            <h4>Heart Rate</h4>
            <p>{healthMetrics.heartRate ? `${healthMetrics.heartRate} bpm` : 'No data available'}</p>
          </div>
          <div>
            <h4>Sleep</h4>
            <p>{healthMetrics.sleep ? `${healthMetrics.sleep} hours` : 'No data available'}</p>
          </div>
          <div>
            <h4>BMI</h4>
            <p>{healthMetrics.bmi ? `${healthMetrics.bmi}` : 'No data available'}</p>
          </div>
          <div>
            <h4>Steps</h4>
            <p>{healthMetrics.steps ? `${healthMetrics.steps} steps` : 'No data available'}</p>
          </div>
        </div>

        {/* Charts */}
        <div style={{ marginTop: '20px' }}>
          {healthMetrics.heartRate || healthMetrics.sleep || healthMetrics.bmi || healthMetrics.steps ? (
            <Chart options={chartOptions.options} series={chartOptions.series} type="radialBar" height={350} />
          ) : (
            <p>No data available to display charts</p>
          )}
        </div>
      </div>

      {/* Modal for Requesting Documents */}
      <Modal title="Request a Document" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
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
