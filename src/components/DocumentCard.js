import React, { useRef, useState } from 'react';

function DocumentCard({ document, onUpload, onDelete }) {
  const fileInputRef = useRef(null);
  const [message, setMessage] = useState('');

  const handleUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      onUpload(file, document.id);
      setMessage('Document uploaded successfully!');
      setTimeout(() => setMessage(''), 3000); // Clear the message after 3 seconds
    }
  };

  const handlePreview = () => {
    if (document.file) {
      window.open(URL.createObjectURL(document.file), '_blank');
    }
  };

  const handleDelete = () => {
    onDelete(document.id);
    setMessage('Document deleted successfully!');
    setTimeout(() => setMessage(''), 3000); // Clear the message after 3 seconds
  };

  return (
    <div className={`document-card ${document.status}`}>
      <h3>{document.name}</h3>
      <p>{document.status === 'uploaded' ? 'Uploaded' : 'Not uploaded'}</p>
      {message && <p className="message">{message}</p>}
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
    </div>
  );
}

export default DocumentCard;
