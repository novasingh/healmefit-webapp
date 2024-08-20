import React from 'react';
import { Form, Input, Collapse, Tooltip } from 'antd';
import PhoneInput from 'react-phone-input-2'; // Make sure you have this package installed

const { Panel } = Collapse; // Correctly reference the Panel sub-component

const DriverDetail = ({ profileData, form }) => {
  return (
    <Collapse defaultActiveKey={['1', '2']} expandIconPosition="end">
      <Panel header={<h4 style={{ color: "#0B5676" }}>Personal Info</h4>} key="1">
        <Form
          form={form}
          initialValues={profileData}
          layout="vertical"
          style={{ justifyContent: "space-between", display: "flex", flexWrap: "wrap", gap: "20px" }}
        >
          <Form.Item label={<div style={{ color: "#BBBBBB" }}>First Name</div>} name="firstName" rules={[{ required: true, message: "Please enter your first name" }]}>
            <Input style={{ width: "300px", color: "#000" }} placeholder="Enter First Name" />
          </Form.Item>
          <Form.Item label={<div style={{ color: "#BBBBBB" }}>Last Name</div>} name="lastName" rules={[{ required: true, message: "Please enter your last name" }]}>
            <Input style={{ width: "300px", color: "#000" }} placeholder="Enter Last Name" />
          </Form.Item>
          <Form.Item label={<div style={{ color: "#BBBBBB" }}>Email</div>} name="email">
            <Tooltip title="Email can't be edited">
              <Input
                style={{
                  width: "300px",
                  color: "#333",
                  backgroundColor: "#f5f5f5",
                  cursor: "not-allowed",
                }}
                value={profileData?.email}
                disabled
              />
            </Tooltip>
          </Form.Item>
          <Form.Item label={<div style={{ color: "#BBBBBB" }}>Phone</div>} name="phone">
            <PhoneInput
              country={'in'} // Set default country to India
              enableSearch={true} // Enable search option in the dropdown
              containerStyle={{ width: "300px" }}
              inputStyle={{ width: "100%", color: "#000" }}
              placeholder="Enter Phone Number"
            />
          </Form.Item>
          <Form.Item label={<div style={{ color: "#BBBBBB" }}>Address</div>} name="address">
            <Input style={{ width: "300px", color: "#000" }} placeholder="Enter Address" />
          </Form.Item>
        </Form>
      </Panel>

      <Panel header={<h4 style={{ color: "#0B5676" }}>Company Info</h4>} key="2">
        <Form
          form={form}
          initialValues={profileData}
          layout="vertical"
          style={{ justifyContent: "space-between", display: "flex", flexWrap: "wrap", gap: "20px" }}
        >
          <Form.Item label={<div style={{ color: "#BBBBBB" }}>Truck Number</div>} name="truckN">
            <Input style={{ width: "300px", color: "#000" }} placeholder="Enter Truck Number" />
          </Form.Item>
          <Form.Item label={<div style={{ color: "#BBBBBB" }}>Driver Number</div>} name="driverN">
            <Input style={{ width: "300px", color: "#000" }} placeholder="Enter Driver Number" />
          </Form.Item>
          <Form.Item label={<div style={{ color: "#BBBBBB" }}>License Plate</div>} name="licensePlate">
            <Input style={{ width: "300px", color: "#000" }} placeholder="Enter License Plate" />
          </Form.Item>
          <Form.Item label={<div style={{ color: "#BBBBBB" }}>Insurance Number</div>} name="insuranceN">
            <Input style={{ width: "300px", color: "#000" }} placeholder="Enter Insurance Number" />
          </Form.Item>
        </Form>
      </Panel>
    </Collapse>
  );
};

export default DriverDetail;
