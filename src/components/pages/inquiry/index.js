import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  Col,
  message,
  Table,
  Skeleton,
  Tooltip,
} from "antd";
import { get } from "../../../utility/httpService";
import { AuthContext } from "../../../contexts/AuthContext";

const Inquiry = () => {
  const { userData } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
    },
    { title: "Email", dataIndex: "email" },
    {
      title: "Message",
      dataIndex: "message",
      render: (_, record) =>
        record.message ? (
          <Tooltip placement="bottom" title={record.message}>
            <div
              style={{
                width: "150px",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                overflow: "hidden",
              }}
            >
              {record.message}
            </div>
          </Tooltip>
        ) : (
          "-"
        ),
    },
    {
      title: "Phone Number",
      dataIndex: "phone",
    },
  ];

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await get("/contact", {
        page: currentPage,
        limit: pageSize,
        sortBy: 'createdAt:desc', 
      });
      setUsers(
        response?.data?.results?.map((user) => ({
          ...user,
          key: user.id,
        })) || []
      );
      setTotalResults(response?.data?.totalResults || 0);
    } catch (error) {
      message.error(
        "An error occurred while fetching inquiry. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    if (currentPage && pageSize) {
      fetchUsers();
    }
  }, [currentPage, fetchUsers, pageSize]);

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };
  return userData?.role === 'admin' ? (
    <div style={{ height: "100%" }}>
      <Col
        style={{
          paddingTop: "2%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <h2
            style={{
              fontSize: "25px",
              color: "#0B5676",
              letterSpacing: "1px",
              fontWeight: "600",
              marginBottom: "10px",
            }}
          >
            Inquiry
          </h2>
        </div>
      </Col>
      {loading ? (
        <Skeleton active />
      ) : users.length === 0 ? (
        <Col
          lg={24}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "80%",
          }}
        >
          <Col
            lg={10}
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <div
              style={{
                textAlign: "center",
                color: "#BBBBBB",
                fontWeight: "600",
              }}
            >
              Looks like you have no inquiry yet.
            </div>
          </Col>
        </Col>
      ) : (
        <Table
          columns={columns}
          dataSource={users}
          pagination={{
            current: currentPage,
            pageSize: 10,
            total: totalResults,
            onChange: (page, pageSize) => {
              setCurrentPage(page);
              setPageSize(pageSize)
            },
          }}
          onChange={handleTableChange}
          className="fixed-pagination"
        />
      )}
    </div>
  )  :  (
    <Col style={{display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%'}}>
    <h1>You don't have access of this page.</h1>
    </Col>
  );;
};

export default Inquiry;
