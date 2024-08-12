import React, { useRef, useState } from 'react';
import axios from 'axios';

function DocumentCard({ document, onUpload, onDelete, userID }) {
  const fileInputRef = useRef(null);
  const [message, setMessage] = useState('');

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      await onUpload(file, document.id);
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
      setMessage('Document deleted successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  return (
    <div style={{color:"#1FA6E0", height:"28vh"}} className={`document-card ${document.status}`}>
      <p style={{fontSize:"12px",color:document.status !== 'uploaded' ? "#1FA6E0" : '#88C43E',paddingBottom:"8px"}}>
        {document.status === 'uploaded' ? 'Uploaded' : 'Not uploaded'}
      </p>
      <h4 style={{textAlign:"left"}}>{document.name}</h4>
      
      {document.status === 'uploaded' ? (
        <>
          <button className="button-preview" onClick={handlePreview}>Preview</button>
          <button className="button-delete" onClick={handleDelete}>Delete</button>
        </>
      ) : (
        <>
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleUpload}
          />
          <button className="upload-icon" onClick={() => fileInputRef.current.click()}>+</button>
        </>
      )}
      {message && <p>{message}</p>}
    </div>
  );
}

export default DocumentCard;
