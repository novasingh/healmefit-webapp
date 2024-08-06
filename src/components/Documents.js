import React, { useState, useEffect } from 'react';
import DocumentCard from './DocumentCard';
import './Documents.css';
import axios from 'axios';

function Documents() {
  const [documents, setDocuments] = useState([]);
  const [uploadedCount, setUploadedCount] = useState(0);

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    const count = documents.filter(doc => doc.status === 'uploaded').length;
    setUploadedCount(count);
  }, [documents]);

  const fetchDocuments = async () => {
    try {
      const response = await axios(`/document/{userID}/documents`); // Replace {userID} with the actual user ID
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const uploadDocument = async (file, documentId) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios(`/document/{userID}/documents`, { // Replace {userID} with the actual user ID
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        setDocuments(prevDocuments =>
          prevDocuments.map(doc =>
            doc.id === documentId ? { ...doc, status: 'uploaded', file } : doc
          )
        );
      } else {
        console.error('Error uploading document:', response.statusText);
      }
    } catch (error) {
      console.error('Error uploading document:', error);
    }
  };

  const deleteDocument = async (documentId) => {
    try {
      const response = await axios(`/document/{userID}/documents/${documentId}`, { // Replace {userID} with the actual user ID
        method: 'DELETE'
      });

      if (response.ok) {
        setDocuments(prevDocuments =>
          prevDocuments.map(doc =>
            doc.id === documentId ? { ...doc, status: 'not_uploaded', file: null } : doc
          )
        );
      } else {
        console.error('Error deleting document:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const progressPercentage = (uploadedCount / documents.length) * 100;

  return (
    <div className="documents-dashboard">
      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>Documents</h1>
          <button className="upload-button">Upload</button>
        </header>
        <div className="documents-section">
        <h2>Required</h2>
        </div>
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${progressPercentage}%` }}>
          </div>
        </div>
        <section className="documents-section">
          <div className="section-header">
            <span className="upload-count">{uploadedCount}/{documents.length} uploaded</span>
            <button className="sort-button">Sort by ▼</button>
          </div>
          <div className="document-list">
            {documents.map(doc => (
              <DocumentCard 
                key={doc.id} 
                document={doc} 
                onUpload={uploadDocument} 
                onDelete={deleteDocument} 
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Documents;
