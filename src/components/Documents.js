import React, { useState, useEffect } from 'react';
import DocumentCard from './DocumentCard';
import './Documents.css';

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
    // Implement API call here
    // For now, we'll use mock data
    setDocuments([
      { id: 1, name: 'ID', status: 'not_uploaded' },
      { id: 2, name: 'Driver License', status: 'not_uploaded' },
      { id: 3, name: 'Resume', status: 'not_uploaded' },
      { id: 4, name: 'Vaccination proof', status: 'not_uploaded' },
      { id: 5, name: 'HR Form', status: 'not_uploaded' },
    ]);
  };

  const uploadDocument = async (file, documentId) => {
    // Implement document upload API call here
    console.log('Uploading document:', file);
    // Simulate an upload success
    setDocuments(prevDocuments =>
      prevDocuments.map(doc =>
        doc.id === documentId ? { ...doc, status: 'uploaded', file } : doc
      )
    );
  };

  const deleteDocument = (documentId) => {
    // Implement document delete API call here
    console.log('Deleting document:', documentId);
    setDocuments(prevDocuments =>
      prevDocuments.map(doc =>
        doc.id === documentId ? { ...doc, status: 'not_uploaded', file: null } : doc
      )
    );
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
          <h2 className="document-heading">Required</h2>
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
