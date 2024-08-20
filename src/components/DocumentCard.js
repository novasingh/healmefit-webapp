import React, { useContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { PlusOutlined } from '@ant-design/icons';
import { remove } from '../utility/httpService';
import { AuthContext } from '../contexts/AuthContext';

function DocumentCard({ document, onUpload, onDelete }) {
  const { userData } = useContext(AuthContext);
  const fileInputRef = useRef(null);
  const [message, setMessage] = useState('');
  const [isUploaded, setIsUploaded] = useState(document.status === 'uploaded');
  
  useEffect(() => {
    if(document.status){
      setIsUploaded(document.status === 'uploaded')
    }
  }, [document.status])
  

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('logo', file);
      axios.post('https://api.healmefit.io/v1/companies/upload-logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', 
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
      })
      .then(response => {
        setIsUploaded(true);
        onUpload(response?.data.logoPath, document)
      })
    }
  };

  const handlePreview = () => {
    if (document.file) {
      window.open(document.file, '_blank');
    }
  };

  const handleDelete = async (id) => {
    try {
      await remove(`/document/${userData?.id}/documents/${document.uid}`).then((res) => {
        onDelete(document);
        setIsUploaded(false);
      })
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
      {!isUploaded && <p className="document-description">{document.description}</p>}
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
