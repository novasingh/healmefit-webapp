import React, { useState, useEffect } from 'react';
import { Modal, Select, Switch, DatePicker, Input, Upload, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;
const { TextArea } = Input;

function DocumentUploadModal({ isVisible, onClose, onSubmit, documentTypes, preselectedDocument }) {
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isExpired, setIsExpired] = useState(false);
  const [expireDate, setExpireDate] = useState(null);
  const [description, setDescription] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState(null)
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    if (preselectedDocument) {
      setSelectedDocument(preselectedDocument?.name);
      setDescription(preselectedDocument.description || '');
    }
  }, [preselectedDocument]);

  const handleOk = () => {
    onSubmit(uploadedFiles.logoPath, uploadedFiles)
    resetFields();
    onClose();   
  };

  const handleCancel = () => {
    resetFields();
    onClose();
  };

  const resetFields = () => {
    setSelectedDocument(null);
    setIsExpired(false);
    setExpireDate(null);
    setDescription('');
    setFileList([]);
  };

  const handleFileChange = ({ fileList }) => {
    const file = fileList[0]?.originFileObj
    const formData = new FormData();
    formData.append('logo', file);
     axios.post('https://api.healmefit.io/v1/companies/upload-logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', 
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
      },
    })
    .then(response => {
      const data ={...preselectedDocument}
      data.name = selectedDocument;
      data.type = selectedDocument;
      data.description = description;
      data.isExpired = isExpired;
      data.logoPath = response?.data.logoPath;
      setUploadedFiles(data)
    })    
  };

  return (
    <Modal
      title="Add Document"
      open={isVisible}
      onOk={handleOk}
      onCancel={handleCancel}
      centered
    >
      {!preselectedDocument && (
        <Select
          style={{ width: '100%', marginBottom: 16 }}
          placeholder="Select document type"
          onChange={(value) => setSelectedDocument(value)}
          value={selectedDocument?.name}
        >
          {documentTypes.map(doc => (
            <Option key={doc.id} value={doc.name}>{doc.name}</Option>
          ))}
          <Option key={6} value={'Other'}>Other</Option>
        </Select>
      )}
      <div style={{ marginBottom: 16 }}>
        <span style={{ marginRight: 8 }}>Expires:</span>
        <Switch checked={isExpired} onChange={setIsExpired} />
      </div>
      {isExpired && (
        <DatePicker
          style={{ width: '100%', marginBottom: 16 }}
          onChange={(date) => setExpireDate(date)}
          value={expireDate}
        />
      )}
      <TextArea
        rows={4}
        placeholder="Add description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{ marginBottom: 16 }}
      />
      <Upload
        onChange={handleFileChange}
        beforeUpload={() => false}
      >
        <Button icon={<PlusOutlined />}>Click to Upload</Button>
      </Upload>
    </Modal>
  );
}

export default DocumentUploadModal;