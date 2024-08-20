import React, { useState, useEffect, useContext, useCallback } from "react";
import DocumentCard from "./DocumentCard";
import DocumentUploadModal from "./DocumentUploadModal";
import "./Documents.css";
import Header from "./Header";
import { Button, Col, message, Spin, Table, Space } from "antd";
import { get, post } from "../utility/httpService";
import { AuthContext } from "../contexts/AuthContext";
import { DownloadOutlined } from "@ant-design/icons";

const initialDocuments = [
  {
    id: 1,
    name: "ID",
    type: "ID",
    status: "not_uploaded",
    description: "Please add the front and back photo of your ID...",
  },
  {
    id: 2,
    name: "Driver License",
    type: "Driver License",
    status: "not_uploaded",
    description: "-",
  },
  {
    id: 3,
    name: "Resume",
    type: "Resume",
    status: "not_uploaded",
    description: "-",
  },
  {
    id: 4,
    name: "Vaccination proof",
    type: "Vaccination Proof",
    status: "not_uploaded",
    description: "Need to have the booster",
  },
  {
    id: 5,
    name: "HR Form",
    type: "HR Form",
    status: "not_uploaded",
    description: "-",
  },
];

function Documents() {
  const [documents, setDocuments] = useState(initialDocuments);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const { userData } = useContext(AuthContext);
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    const count = documents.filter((doc) => doc.status === "uploaded").length;
    setUploadedCount(count);
  }, [documents]);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    const response = await get(`/document/${userData.id}/documents`);
    if (response?.data?.length > 0) {
      const updatedDocuments = initialDocuments.map((doc) => {
        const matchedDoc = response?.data?.find(
          (apiDoc) => apiDoc.type === doc.type
        );
        if (matchedDoc) {
          return {
            ...doc,
            file: matchedDoc.fileUrl,
            uid: matchedDoc._id,
            status: "uploaded",
          };
        }
        return doc;
      });
      const dataTable = response?.data?.filter((obj) => obj.type === "Other");
      setTableData(dataTable);
      setDocuments(updatedDocuments);
      setLoading(false);
    }
    setLoading(false);
  }, [userData?.id]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleUpload = async (uploadedFile, documentId) => {
    await post(`/document/${userData.id}/documents`, {
      name: documentId.name,
      description: documentId.description,
      fileUrl: uploadedFile,
      type: documentId.type,
    }).then((res) => {
      if (res.status === 201) {
        message.success(`${documentId.type} uploaded successfully.`);
        const updatedDocuments = documents.map((doc) =>
          doc.id === documentId.id
            ? {
                ...doc,
                status: "uploaded",
                file: uploadedFile,
                uid: res?.data?._id,
              }
            : doc
        );
        setDocuments(updatedDocuments);
        fetchDocuments();
      }
    });
  };

  const handleDelete = (documentId) => {
    if (documentId) {
      const updatedDocuments = documents.map((doc) =>
        doc.id === documentId.id
          ? { ...doc, status: "not_uploaded", file: null, uid: null }
          : doc
      );
      setDocuments(updatedDocuments);
      message.success(`${documentId.type} deleted successfully.`);
    }
  };

  const progressPercentage = (uploadedCount / documents.length) * 100;

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "fileUrl",
      render: (text, record) => (
        <Space>
          <div
            style={{
              width: 50,
              height: 50,
              backgroundColor: "#f0f0f0",
              borderRadius: 4,
            }}
          >
            <img
              src={record.fileUrl}
              style={{ borderRadius: 4 }}
              alt={record.name}
              width={50}
              height={50}
            />
          </div>
          <div>
            <div>{text}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Uploaded on",
      dataIndex: "uploadDate",
      key: "uploadDate",
    },
    {
      title: "",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            onClick={() => window.open(record.fileUrl, "_blank")}
            icon={<DownloadOutlined />}
          />
        </Space>
      ),
    },
  ];

  return loading ? (
    <Col
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
      }}
    >
      <Spin />
    </Col>
  ) : (
    <div>
      <Header />
      <div className="documents-dashboard">
        <main className="dashboard-main">
          <header className="dashboard-header">
            <h3 className="dashboard-title">Documents</h3>
            <Button
              className="upload-button"
              onClick={() => setIsModalVisible(true)}
            >
              Upload
            </Button>
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
              {/* <button className="see-less-button">See less ^</button> */}
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
        {tableData.length > 0 && (
          <div style={{ marginTop: "50px" }}>
            <Table
              columns={columns}
              dataSource={tableData}
              pagination={false}
            />
          </div>
        )}
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
