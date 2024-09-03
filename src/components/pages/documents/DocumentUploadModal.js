import React, { useState, useEffect } from 'react';
import { Modal, Select, Switch, DatePicker, Input, Upload, Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;
const { TextArea } = Input;

function DocumentUploadModal({ isVisible, onClose, onSubmit, documentTypes, preselectedDocument }) {
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isExpired, setIsExpired] = useState(false);
  const [expireDate, setExpireDate] = useState(null);
  const [description, setDescription] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [isOther, setIsOther] = useState(false);
  const [otherDocumentTitle, setOtherDocumentTitle] = useState('');

  useEffect(() => {
    if (preselectedDocument) {
      setSelectedDocument(preselectedDocument?.name);
      setDescription(preselectedDocument.description || '');
      setExpireDate(preselectedDocument.expireDate || null);
      setIsExpired(preselectedDocument.isExpired || false);
    }
  }, [preselectedDocument]);

  const handleOk = () => {
    if (!uploadedFiles) {
      message.error("No files uploaded yet.");
      return;
    }

    onSubmit(uploadedFiles.logoPath, uploadedFiles);
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
    setIsOther(false);
    setOtherDocumentTitle('');
  };

  const handleFileChange = ({ fileList }) => {
    const file = fileList[0]?.originFileObj;
    const formData = new FormData();
    formData.append('logo', file);

    axios.post('https://api.healmefit.io/v1/companies/upload-logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
      },
    })
    .then(response => {
      const data = { ...preselectedDocument };
      const documentTitle = isOther ? otherDocumentTitle : selectedDocument;
      data.name = selectedDocument;
      data.type = selectedDocument;
      data.description = description;
      data.isExpired = isExpired;
      data.expireAt = expireDate;
      data.logoPath = response?.data.logoPath;
      data.title = documentTitle
      setUploadedFiles(data);
    });
  };

  const handleDocumentTypeChange = (value) => {
    setSelectedDocument(value);
    setIsOther(value === 'Other');
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
        <>
          <Select
            style={{ width: '100%', marginBottom: 16 }}
            placeholder="Select document type"
            onChange={handleDocumentTypeChange}
            value={selectedDocument}
          >
            {documentTypes.map(doc => (
              <Option key={doc.id} value={doc.name}>{doc.name}</Option>
            ))}
            <Option key="other" value="Other">Other</Option>
          </Select>
          {isOther && (
            <Input
              placeholder="Enter document title"
              value={otherDocumentTitle}
              onChange={(e) => setOtherDocumentTitle(e.target.value)}
              style={{ marginBottom: 16 }}
            />
          )}
        </>
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
