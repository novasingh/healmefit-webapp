import React, { useState, useEffect } from "react";
import DocumentCard from "./DocumentCard";
import DocumentUploadModal from "./DocumentUploadModal";
import "./Documents.css";
import Header from "./Header";
import { Button } from "antd";

function Documents() {
  const [documents, setDocuments] = useState([]);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    const count = documents.filter((doc) => doc.status === "uploaded").length;
    setUploadedCount(count);
  }, [documents]);

  const fetchDocuments = async () => {
    // Simulating API call with mock data
    setDocuments([
      { id: 1, name: "ID", status: "not_uploaded", description: "Please add the front and back photo of your ID..." },
      { id: 2, name: "Driver License", status: "not_uploaded", description: "-" },
      { id: 3, name: "Resume", status: "not_uploaded", description: "-" },
      { id: 4, name: "Vaccination proof", status: "not_uploaded", description: "Need to have the booster" },
      { id: 5, name: "HR Form", status: "not_uploaded", description: "-" },
    ]);
  };

  const handleUpload = (uploadedFile, documentId) => {
    const updatedDocuments = documents.map(doc =>
      doc.id === documentId ? { ...doc, status: "uploaded", file: uploadedFile } : doc
    );
    setDocuments(updatedDocuments);
  };

  const handleDelete = (documentId) => {
    const updatedDocuments = documents.map(doc =>
      doc.id === documentId ? { ...doc, status: "not_uploaded", file: null } : doc
    );
    setDocuments(updatedDocuments);
  };

  const handleCardUpload = (document) => {
    setSelectedDocument(document);
    setIsModalVisible(true);
  };

  const progressPercentage = (uploadedCount / documents.length) * 100;

  return (
    <div>
      <Header />
      <div className="documents-dashboard">
        <main className="dashboard-main">
          <header className="dashboard-header">
            <h3 className="dashboard-title">Documents</h3>
            <Button className="upload-button" onClick={() => setIsModalVisible(true)}>Upload</Button>
          </header>
          <div className="documents-section">
            <div className="document-heading">
              Required{" "}
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <span className="upload-count">
                {uploadedCount}/{documents.length} uploaded
              </span>
              <button className="see-less-button">See less ^</button>
            </div>
          </div>
          <section className="documents-section">
            <div className="document-list">
              {documents.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  onDelete={handleDelete}
                  onUpload={handleUpload}
                />
              ))}
            </div>
          </section>
        </main>
      </div>
      <DocumentUploadModal
        isVisible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
          setSelectedDocument(null);
        }}
        onSubmit={handleUpload}
        documentTypes={documents}
        preselectedDocument={selectedDocument}
      />
    </div>
  );
}

export default Documents;
