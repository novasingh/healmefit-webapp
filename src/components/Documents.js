import React, { useState, useEffect } from 'react';
import DocumentCard from './DocumentCard';
import './Documents.css';
import Header from './Header';
import { Button, Col } from 'antd';

function Documents(props) {
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

  return (<div className={props.class}>
    <Header/>
    <Col lg={24} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      </Col>
    <div className="documents-dashboard">
      
      <main className="dashboard-main">
        <header className="dashboard-header">
        <h3 style={{ fontSize: "25px", color: "#0B5676", letterSpacing: "1px", fontWeight: "600", marginBottom: '10px', marginTop: "3%" }}>Documents</h3>

        <Button style={{width: "10%", height: "40px", color: "#1FA6E0", border:"1.5px solid #1FA6E0",fontWeight:"600" }}>Upload</Button>
        </header>
        <div className="documents-section">
          <div style={{display:"flex", alignItems:"center", gap:"8px"}} className="document-heading">Required <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${progressPercentage}%` }}>
          </div></div><div style={{display:"flex", color:"#BBBBB"}}>2/5 Uploaded</div>
          
        </div>
        
        </div>
        <section className="documents-section">
          {/* <div className="section-header">
            <span className="upload-count">{uploadedCount}/{documents.length} uploaded</span>
            <button className="sort-button">Sort by ▼</button>
          </div> */}
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
    </div>
  );
}

export default Documents;
