import React, { useState, useEffect } from 'react';
import { Modal, Select, Switch, DatePicker, Input, Upload } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

function DocumentUploadModal({ isVisible, onClose, onSubmit, documentTypes, preselectedDocument }) {
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isExpired, setIsExpired] = useState(false);
  const [expireDate, setExpireDate] = useState(null);
  const [description, setDescription] = useState('');
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    if (preselectedDocument) {
      setSelectedDocument(preselectedDocument.name);
      setDescription(preselectedDocument.description || '');
    }
  }, [preselectedDocument]);

  const handleOk = () => {
    onSubmit({
      id: preselectedDocument ? preselectedDocument.id : null,
      name: selectedDocument,
      status: 'uploaded',
      description: description,
      expireDate: isExpired ? expireDate : null,
      files: fileList
    });
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

  const handleFileChange = ({ fileList }) => setFileList(fileList);

  return (
    <Modal
      title="Add Document"
      visible={isVisible}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      {!preselectedDocument && (
        <Select
          style={{ width: '100%', marginBottom: 16 }}
          placeholder="Select document type"
          onChange={(value) => setSelectedDocument(value)}
          value={selectedDocument}
        >
          {documentTypes.map(doc => (
            <Option key={doc.id} value={doc.name}>{doc.name}</Option>
          ))}
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
        listType="picture-card"
        fileList={fileList}
        onChange={handleFileChange}
        beforeUpload={() => false}
      >
        <div>
          <PlusOutlined />
          <div style={{ marginTop: 8 }}>Upload</div>
        </div>
      </Upload>
    </Modal>
  );
}

export default DocumentUploadModal;