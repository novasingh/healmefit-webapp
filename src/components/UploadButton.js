import React from 'react';

function UploadButton({ onUpload }) {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div className="upload-button">
      <label htmlFor="file-upload" className="custom-file-upload">
        Upload
      </label>
      <input id="file-upload" type="file" onChange={handleFileChange} />
    </div>
  );
}

export default UploadButton;
