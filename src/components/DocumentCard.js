import React, { useRef, useState } from 'react';
import axios from 'axios';
import { PlusOutlined } from '@ant-design/icons';

function DocumentCard({ document, onUpload, onDelete }) {
  const fileInputRef = useRef(null);
  const [message, setMessage] = useState('');
  const [isUploaded, setIsUploaded] = useState(document.status === 'uploaded');

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      await onUpload(file, document.id);
      setIsUploaded(true); // Set the card to green
      setMessage('Document uploaded successfully!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handlePreview = () => {
    if (document.file) {
      window.open(document.file, '_blank');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/documents/${document.id}`);
      onDelete(document.id);
      setIsUploaded(false); // Reset the card color if deleted
      setMessage('Document deleted successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  return (
    <div className={`document-card ${isUploaded ? 'uploaded' : ''}`}>
      <p className="document-status">
        {isUploaded ? 'Uploaded' : 'Not uploaded'}
      </p>
      <h4 className="document-name">{document.name}</h4>
      <p className="document-description">{document.description}</p>
      {document.expireDate && (
        <p className="document-expire">Expires: {document.expireDate.format('YYYY-MM-DD')}</p>
      )}
      {isUploaded ? (
        <div className="document-actions">
          <button className="button-preview" onClick={handlePreview}>View</button>
          <button className="button-delete" onClick={handleDelete}>Delete</button>
        </div>
      ) : (
        <div>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleUpload}
          />
          <button className="upload-icon" onClick={() => fileInputRef.current.click()}>
            <PlusOutlined />
          </button>
        </div>
      )}
      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default DocumentCard;
