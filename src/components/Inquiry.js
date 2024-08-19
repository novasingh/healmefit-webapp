// src/components/Inquiry.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Inquiry.css';
import { get, post } from "../utility/httpService";// import './Inquiry.css'; // Create this file for custom styling if needed

const Inquiry = () => {
  const [inquiries, setInquiries] = useState([]);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const response = await get('/contact');
      if (Array.isArray(response.data)) {
        setInquiries(response.data);
      } else {
        console.error('Unexpected response format:', response.data);
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    }
  };

  return (
    <div className="inquiry-container">
      <h3 className="inquiry-title">Inquiries</h3>
      <table className="inquiry-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Message</th>
          </tr>
        </thead>
        <tbody>
          {inquiries.length > 0 ? (
            inquiries.map((inquiry) => (
              <tr key={inquiry.id}>
                <td>{inquiry.name}</td>
                <td>{inquiry.email}</td>
                <td>{inquiry.phone}</td>
                <td>{inquiry.message}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No inquiries available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Inquiry;
