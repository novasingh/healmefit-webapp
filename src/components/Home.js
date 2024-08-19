import React, { useEffect, useState } from "react";
import { Input, Button, Form, notification, Tooltip, Collapse } from "antd";
import Header from "./Header";
import { get, updatePatch } from "../utility/httpService";
import moment from "moment";
import 'react-phone-input-2/lib/style.css';
import PhoneInput from 'react-phone-input-2';

const Home = () => {
  const [form] = Form.useForm();
  const userData = JSON.parse(sessionStorage.getItem('user')) || {}
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(userData);

  const { Panel } = Collapse;

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const response = await get(`/users/${userData.id}`);
        const userDob = response.data.dob ? moment(response.data.dob) : moment();
        response.data.dob = userDob;
        setProfileData(response.data);
        sessionStorage.setItem('user', JSON.stringify(response.data));
        form.setFieldsValue({
          ...response.data,
          dob: userDob.format("YYYY-MM-DD"),
        });
      } catch (error) {
        console.error("Failed to fetch user data", error);
      } finally {
        setLoading(false);
      }
    };

    if (userData?.id) {
      fetchUserData();
    }
  }, [userData.id, form]);

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const formattedDob = moment(values.dob).format("YYYY-MM-DD");
      const data = {
        firstName: values.firstName,
        lastName: values.lastName,
        dob: formattedDob ? formattedDob : null,
        address: values.address ? values.address : 'N/A',
        truckN: values.truckN ? values.truckN : 'N/A',
        driverN: values.driverN ? values.driverN : 'N/A',
        licensePlate: values.licensePlate ? values.licensePlate : 'N/A',
        insuranceN: values.insuranceN ? values.insuranceN : 'N/A',
        phone: values.phone
      };

      const response = await updatePatch(`/users/${userData.id}`, data);

      setProfileData(response.data);
      sessionStorage.setItem('user', JSON.stringify(response.data));
      form.resetFields();
      notification.success({ message: "Profile updated successfully!" });
    } catch (error) {
      console.error("Failed to update profile", error.response?.data || error.message);
      notification.error({ message: `Failed to update profile: ${error.response?.data?.message || error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const WelcomeMessage = ({ userData }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
      const messageStatus = localStorage.getItem('welcomeMessageStatus');
      if (messageStatus === 'dismissed') {
        setIsVisible(false);
      }
    }, []);

    const handleClose = () => {
      setIsVisible(false);
      localStorage.setItem('welcomeMessageStatus', 'dismissed');
    };

    if (!isVisible) return null;

    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#E7F8D6', padding: '10px', borderRadius: '5px', marginTop: '10px' }}>
        <p style={{ color: "#88C43E", margin: "auto", textAlign: "left", flex: 1 }}>
          Welcome {userData?.firstName}! Don’t forget to enter all missing
          information on your profile.
        </p>
        <button onClick={handleClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '26px', color: 'white', marginLeft: '10px' }}>
          &times;
        </button>
      </div>
    );
  };

  return (
    <div>
      <Header />
      <WelcomeMessage userData={userData} /> {/* Display the WelcomeMessage */}
      <div
        style={{
          marginTop: "30px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
        }}
        className="search_bar"
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              width: "70px",
              height: "70px",
              border: "0.4px solid #d9d9d9",
              background: "#f2f2f2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#BBBBBB",
              borderRadius: "50%",
              fontSize: "32px",
            }}
          >
            {profileData?.firstName?.charAt(0)}{profileData?.lastName?.charAt(0)}
          </div>
          <div>
            <p style={{ margin: "auto", fontWeight: "600", fontSize: "24px" }}>
              {profileData?.firstName} {profileData?.lastName}
            </p>
          </div>
        </div>
        <div>
          <Button
            type="primary"
            loading={loading}
            onClick={handleSaveChanges}
          >
            Save Changes
          </Button>
        </div>
      </div>
      <div style={{ marginTop: "20px" }}>
        <div>
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

              {profileData?.role === "driver" && (
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
              )}
            
          </Collapse>
        </div>
      </div>
    </div>
  );
};

export default Home;
