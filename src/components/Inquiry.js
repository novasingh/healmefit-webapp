import React, { useState, useEffect, useCallback } from "react";
import Header from "./Header";
import "../style.css";
import {
  Col,
  message,
  Table,
  Skeleton,
  Tooltip,
} from "antd";
import { get } from "../utility/httpService";

const Inquiry = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [contactData, setContactData] = useState([])
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
            <div style={{width: '150px', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden'}}>{record.message}</div>
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
      });
      setUsers(
        response?.data?.results?.map((user) => ({
          ...user,
          key: user.id,
        })) || []
      );
      setTotalResults(response?.totalResults || 0);
    } catch (error) {
      message.error(
        "An error occurred while fetching inquiry. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  // const handleDeleteUser = async (id) => {
  //   await remove(`/contact/${id}`).then(
  //     (response) => {
  //       if (response) {
  //         message.success("Inquiry Deleted Successfully.");
  //         fetchUsers();
  //       }
  //     },
  //     (error) => {
  //       console.log(error);
  //     }
  //   );
  // };

  useEffect(() => {
    if (currentPage && pageSize) {
      fetchUsers();
    }
  }, [currentPage, fetchUsers, pageSize]);

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  return (
    <div style={{ height: "100%" }}>
      <Header />
      <Col
        style={{
          paddingTop: "2%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
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
        <div
          style={{ display: "flex", alignItems: "center", gap: "20px" }}
        ></div>
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
            pageSize,
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
  );
};

export default Inquiry;
